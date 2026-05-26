import { createGoal, listActiveGoals } from '../src/features/goals/api';
import { supabase } from '../src/lib/supabase';

const mockFrom = supabase.from as jest.Mock;

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

describe('goals api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates a personal goal through the database RPC', async () => {
    const goal = {
      id: 'goal-1',
      owner_user_id: 'user-1',
      challenge_id: null,
      title: 'Read',
      deadline_time: '21:00:00',
      timezone: 'Asia/Kolkata',
      status: 'active',
    };
    const mockRpc = supabase.rpc as jest.Mock;
    mockRpc.mockResolvedValue({ data: goal, error: null });

    await expect(
      createGoal({
        challengeId: null,
        deadlineTime: '21:00:00',
        timezone: 'Asia/Kolkata',
        title: ' Read ',
      }),
    ).resolves.toBe(goal);

    expect(mockRpc).toHaveBeenCalledWith('create_goal', {
      target_challenge_id: null,
      target_deadline_time: '21:00:00',
      target_timezone: 'Asia/Kolkata',
      target_title: 'Read',
    });
  });

  function mockGoalAndCheckInQueries(goals: unknown[], checkIns: unknown[]) {
    const order = jest.fn().mockResolvedValue({ data: goals, error: null });
    const statusEq = jest.fn(() => ({ order }));
    const ownerEq = jest.fn(() => ({ eq: statusEq }));
    const select = jest.fn(() => ({ eq: ownerEq }));
    const localDateIn = jest.fn().mockResolvedValue({ data: checkIns, error: null });
    const goalIdIn = jest.fn(() => ({ in: localDateIn }));
    const checkInOwnerEq = jest.fn(() => ({ in: goalIdIn }));
    const checkInSelect = jest.fn(() => ({ eq: checkInOwnerEq }));
    mockFrom.mockImplementation((table: string) => {
      if (table === 'goals') return { select };
      if (table === 'check_ins') return { select: checkInSelect };
      throw new Error(`Unexpected table ${table}`);
    });

    return { checkInOwnerEq, checkInSelect, goalIdIn, localDateIn, order, ownerEq, select, statusEq };
  }

  it('lists active goals for the current user with today check-in state', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-26T10:00:00.000Z'));
    const goals = [{ id: 'goal-1', title: 'Read', timezone: 'Asia/Kolkata' }];
    const checkIns = [
      { goal_id: 'goal-1', id: 'check-in-1', local_date: '2026-05-26', status: 'done' },
    ];
    const { checkInOwnerEq, checkInSelect, goalIdIn, localDateIn, order, ownerEq, select, statusEq } =
      mockGoalAndCheckInQueries(goals, checkIns);

    await expect(listActiveGoals('user-1')).resolves.toEqual([
      { ...goals[0], today_check_in: checkIns[0] },
    ]);

    expect(select).toHaveBeenCalledWith('*');
    expect(ownerEq).toHaveBeenCalledWith('owner_user_id', 'user-1');
    expect(statusEq).toHaveBeenCalledWith('status', 'active');
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(checkInSelect).toHaveBeenCalledWith('id, goal_id, local_date, status');
    expect(checkInOwnerEq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(goalIdIn).toHaveBeenCalledWith('goal_id', ['goal-1']);
    expect(localDateIn).toHaveBeenCalledWith('local_date', ['2026-05-26']);
  });

  it('can scope active goals to personal tracker goals', async () => {
    const order = jest.fn().mockResolvedValue({ data: [], error: null });
    const personalIs = jest.fn(() => ({ order }));
    const statusEq = jest.fn(() => ({ is: personalIs, order }));
    const ownerEq = jest.fn(() => ({ eq: statusEq }));
    const select = jest.fn(() => ({ eq: ownerEq }));
    mockFrom.mockReturnValue({ select });

    await expect(listActiveGoals('user-1', { type: 'personal' })).resolves.toEqual([]);

    expect(personalIs).toHaveBeenCalledWith('challenge_id', null);
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('can scope active goals to one challenge', async () => {
    const order = jest.fn().mockResolvedValue({ data: [], error: null });
    const challengeEq = jest.fn(() => ({ order }));
    const statusEq = jest.fn(() => ({ eq: challengeEq, order }));
    const ownerEq = jest.fn(() => ({ eq: statusEq }));
    const select = jest.fn(() => ({ eq: ownerEq }));
    mockFrom.mockReturnValue({ select });

    await expect(
      listActiveGoals('user-1', { challengeId: 'challenge-1', type: 'challenge' }),
    ).resolves.toEqual([]);

    expect(challengeEq).toHaveBeenCalledWith('challenge_id', 'challenge-1');
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
  });
});
