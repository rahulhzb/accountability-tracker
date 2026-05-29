import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  buildMissedCheckInCandidate,
  isDuplicateCheckInError,
} from '../supabase/functions/generate-missed-checkins/deadline';

describe('missed check-in deadline job', () => {
  it('builds a missed check-in candidate after the goal deadline in its timezone', () => {
    const candidate = buildMissedCheckInCandidate(
      {
        challenge_id: 'challenge-1',
        created_at: '2026-05-20T04:00:00.000Z',
        deadline_time: '21:00:00',
        id: 'goal-1',
        owner_user_id: 'user-1',
        timezone: 'Asia/Kolkata',
      },
      new Date('2026-05-20T16:00:00.000Z'),
    );

    expect(candidate).toEqual({
      challengeId: 'challenge-1',
      goalId: 'goal-1',
      localDate: '2026-05-20',
      missedRule: 'visible_only',
      userId: 'user-1',
    });
  });

  it('uses yesterday when a late job runs after local midnight before today deadline', () => {
    const candidate = buildMissedCheckInCandidate(
      {
        challenge_id: null,
        created_at: '2026-05-19T12:00:00.000Z',
        deadline_time: '21:00',
        id: 'goal-1',
        owner_user_id: 'user-1',
        timezone: 'America/New_York',
      },
      new Date('2026-05-21T04:30:00.000Z'),
    );

    expect(candidate).toEqual({
      challengeId: null,
      goalId: 'goal-1',
      localDate: '2026-05-20',
      missedRule: 'visible_only',
      userId: 'user-1',
    });
  });

  it('skips goals that have not reached their first possible missed deadline', () => {
    const candidate = buildMissedCheckInCandidate(
      {
        challenge_id: null,
        created_at: '2026-05-20T22:00:00.000Z',
        deadline_time: '21:00',
        id: 'goal-1',
        owner_user_id: 'user-1',
        timezone: 'America/New_York',
      },
      new Date('2026-05-20T23:00:00.000Z'),
    );

    expect(candidate).toBeNull();
  });

  it('treats duplicate check-in insert errors as retry-safe conflicts', () => {
    expect(isDuplicateCheckInError({ code: '23505' })).toBe(true);
    expect(isDuplicateCheckInError({ message: 'duplicate key value violates unique constraint' })).toBe(
      true,
    );
    expect(isDuplicateCheckInError({ code: '42501', message: 'permission denied' })).toBe(false);
  });

  it('uses the service role client and creates missed feed events for challenge goals', () => {
    const functionSource = readFileSync(
      join(__dirname, '..', 'supabase', 'functions', 'generate-missed-checkins', 'index.ts'),
      'utf8',
    );

    expect(functionSource).toContain("Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')");
    expect(functionSource).toContain("Deno.env.get('DEADLINE_JOB_SECRET')");
    expect(functionSource).toContain("authorization !== `Bearer ${deadlineJobSecret}`");
    expect(functionSource).toContain("status: 'missed'");
    expect(functionSource).toContain('auto_marked_missed: true');
    expect(functionSource).toContain("event_type: 'check_in_missed'");
    expect(functionSource).toContain("onConflict: 'check_in_id,event_type'");
    expect(functionSource).toContain('ignoreDuplicates: true');
    expect(functionSource).toContain('isDuplicateCheckInError(insertError)');
    expect(functionSource).toContain('ensureMissedFeedEvent(candidate, existingCheckIn.id)');
    expect(functionSource).toContain('Goal ${goal.id}:');
  });

  it('creates recovery actions only for challenges with recovery rules', () => {
    const functionSource = readFileSync(
      join(__dirname, '..', 'supabase', 'functions', 'generate-missed-checkins', 'index.ts'),
      'utf8',
    );

    expect(functionSource).toContain('challenges!goals_challenge_id_fkey(missed_rule)');
    expect(functionSource).toContain('ensureRecoveryAction(candidate, checkIn.id)');
    expect(functionSource).toContain("candidate.missedRule === 'visible_only'");
    expect(functionSource).toContain(".from('recovery_actions')");
    expect(functionSource).toContain("status: 'pending'");
    expect(functionSource).toContain("event_type: 'recovery_assigned'");
    expect(functionSource).toContain("template: recoveryTemplate(candidate.missedRule)");
  });
});
