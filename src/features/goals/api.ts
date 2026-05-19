import { supabase } from '../../lib/supabase';

export type Goal = {
  id: string;
  owner_user_id: string;
  challenge_id: string | null;
  title: string;
  deadline_time: string;
  timezone: string;
  status: 'active' | 'paused' | 'archived';
};

export async function createGoal(input: {
  challengeId: string | null;
  title: string;
  deadlineTime: string;
  timezone: string;
}) {
  const { data, error } = await supabase.rpc('create_goal', {
    target_challenge_id: input.challengeId,
    target_deadline_time: input.deadlineTime,
    target_timezone: input.timezone,
    target_title: input.title.trim(),
  });

  if (error) {
    throw error;
  }

  return data as Goal;
}

export async function listActiveGoals(userId: string) {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('owner_user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as Goal[];
}
