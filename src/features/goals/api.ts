import { supabase } from '../../lib/supabase';
import { getLocalDateKey } from '../../lib/dates';

export type GoalTodayCheckIn = {
  id: string;
  local_date: string;
  status: 'done' | 'skipped' | 'missed';
};

export type Goal = {
  id: string;
  owner_user_id: string;
  challenge_id: string | null;
  title: string;
  deadline_time: string;
  timezone: string;
  status: 'active' | 'paused' | 'archived';
  today_check_in?: GoalTodayCheckIn | null;
};

export type ActiveGoalScope =
  | { type: 'all' }
  | { type: 'personal' }
  | { challengeId: string; type: 'challenge' };

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

export async function listActiveGoals(userId: string, scope: ActiveGoalScope = { type: 'all' }) {
  let query = supabase
    .from('goals')
    .select('*')
    .eq('owner_user_id', userId)
    .eq('status', 'active');

  if (scope.type === 'personal') {
    query = query.is('challenge_id', null);
  }

  if (scope.type === 'challenge') {
    query = query.eq('challenge_id', scope.challengeId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const goals = data as Goal[];
  const goalIds = goals.map((goal) => goal.id);

  if (goalIds.length === 0) {
    return goals;
  }

  const localDateByGoalId = new Map(
    goals.map((goal) => [goal.id, getLocalDateKey(new Date(), goal.timezone)]),
  );
  const localDates = [...new Set(localDateByGoalId.values())];

  const { data: checkIns, error: checkInsError } = await supabase
    .from('check_ins')
    .select('id, goal_id, local_date, status')
    .eq('user_id', userId)
    .in('goal_id', goalIds)
    .in('local_date', localDates);

  if (checkInsError) {
    throw checkInsError;
  }

  const checkInByGoalDate = new Map(
    (checkIns ?? []).map((checkIn) => [`${checkIn.goal_id}:${checkIn.local_date}`, checkIn]),
  );

  return goals.map((goal) => ({
    ...goal,
    today_check_in:
      checkInByGoalDate.get(`${goal.id}:${localDateByGoalId.get(goal.id)}`) ?? null,
  }));
}
