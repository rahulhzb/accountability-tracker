import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import {
  type ActiveGoal,
  buildMissedCheckInCandidate,
  isDuplicateCheckInError,
} from './deadline.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const deadlineJobSecret = Deno.env.get('DEADLINE_JOB_SECRET');

if (!supabaseUrl || !serviceRoleKey || !deadlineJobSecret) {
  throw new Error('Missing Supabase service environment');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function ensureMissedFeedEvent(candidate: {
  challengeId: string | null;
  userId: string;
}, checkInId: string): Promise<{ error: { message: string } | null; inserted: boolean }> {
  if (!candidate.challengeId) {
    return { error: null, inserted: false };
  }

  const { data, error } = await supabase
    .from('feed_events')
    .upsert(
      {
        actor_user_id: candidate.userId,
        challenge_id: candidate.challengeId,
        check_in_id: checkInId,
        event_type: 'check_in_missed',
      },
      { ignoreDuplicates: true, onConflict: 'check_in_id,event_type' },
    )
    .select('id');

  return { error, inserted: !error && (data?.length ?? 0) > 0 };
}

Deno.serve(async (request) => {
  const authorization = request.headers.get('authorization') ?? '';

  if (authorization !== `Bearer ${deadlineJobSecret}`) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const checkedAt = new Date();
  const errors: string[] = [];
  let duplicates = 0;
  let inserted = 0;
  let repairedFeedEvents = 0;
  let skippedBeforeFirstDeadline = 0;

  const { data: goals, error } = await supabase
    .from('goals')
    .select('id, owner_user_id, challenge_id, created_at, deadline_time, timezone')
    .eq('status', 'active');

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  for (const goal of (goals ?? []) as ActiveGoal[]) {
    let candidate;

    try {
      candidate = buildMissedCheckInCandidate(goal, checkedAt);
    } catch (candidateError) {
      errors.push(
        candidateError instanceof Error
          ? `Goal ${goal.id}: ${candidateError.message}`
          : `Goal ${goal.id}: invalid deadline data`,
      );
      continue;
    }

    if (!candidate) {
      skippedBeforeFirstDeadline += 1;
      continue;
    }

    const { data: checkIn, error: insertError } = await supabase
      .from('check_ins')
      .insert({
        auto_marked_missed: true,
        goal_id: candidate.goalId,
        local_date: candidate.localDate,
        status: 'missed',
        submitted_at: null,
        user_id: candidate.userId,
      })
      .select('id')
      .single();

    if (insertError) {
      if (isDuplicateCheckInError(insertError)) {
        console.log('Missed check-in already exists', {
          goal_id: candidate.goalId,
          local_date: candidate.localDate,
        });
        duplicates += 1;

        const { data: existingCheckIn, error: existingError } = await supabase
          .from('check_ins')
          .select('id')
          .eq('goal_id', candidate.goalId)
          .eq('local_date', candidate.localDate)
          .eq('status', 'missed')
          .maybeSingle();

        if (existingError) {
          errors.push(existingError.message);
          continue;
        }

        if (existingCheckIn) {
          const feedResult = await ensureMissedFeedEvent(candidate, existingCheckIn.id);

          if (feedResult.error) {
            errors.push(feedResult.error.message);
          } else if (feedResult.inserted) {
            repairedFeedEvents += 1;
          }
        }

        continue;
      }

      errors.push(insertError.message);
      continue;
    }

    inserted += 1;

    const feedResult = await ensureMissedFeedEvent(candidate, checkIn.id);

    if (feedResult.error) {
      errors.push(feedResult.error.message);
    }
  }

  return Response.json(
    {
      checked_at: checkedAt.toISOString(),
      duplicates,
      errors,
      goals_seen: goals?.length ?? 0,
      inserted,
      ok: errors.length === 0,
      repaired_feed_events: repairedFeedEvents,
      skipped_before_first_deadline: skippedBeforeFirstDeadline,
    },
    { status: errors.length === 0 ? 200 : 500 },
  );
});
