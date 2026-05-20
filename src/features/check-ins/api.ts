import { getLocalDateKey } from '../../lib/dates';
import { supabase } from '../../lib/supabase';

export type CheckInStatus = 'done' | 'skipped';

const eventTypeByStatus = {
  done: 'check_in_done',
  skipped: 'check_in_skipped',
} as const;

export async function submitCheckIn(input: {
  goalId: string;
  userId: string;
  timezone: string;
  status: CheckInStatus;
  note: string;
}) {
  const now = new Date();
  const localDate = getLocalDateKey(now, input.timezone);

  const { data, error } = await supabase
    .from('check_ins')
    .upsert(
      {
        auto_marked_missed: false,
        goal_id: input.goalId,
        local_date: localDate,
        note: input.note.trim() || null,
        status: input.status,
        submitted_at: now.toISOString(),
        user_id: input.userId,
      },
      { onConflict: 'goal_id,local_date' },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .select('challenge_id')
    .eq('id', input.goalId)
    .single();

  if (goalError) {
    throw goalError;
  }

  if (goal?.challenge_id) {
    const { error: feedError } = await supabase
      .from('feed_events')
      .upsert(
        {
          actor_user_id: input.userId,
          challenge_id: goal.challenge_id,
          check_in_id: data.id,
          event_type: eventTypeByStatus[input.status],
        },
        { ignoreDuplicates: true, onConflict: 'check_in_id,event_type' },
      );

    if (feedError) {
      throw feedError;
    }
  }

  return data;
}
