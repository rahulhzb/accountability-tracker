import { getLocalDateKey } from '../../lib/dates';
import { supabase } from '../../lib/supabase';

export type CheckInStatus = 'done' | 'skipped';

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

  return data;
}
