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

  it('lists only active goals for the current user', async () => {
    const goals = [{ id: 'goal-1', title: 'Read' }];
    const order = jest.fn().mockResolvedValue({ data: goals, error: null });
    const statusEq = jest.fn(() => ({ order }));
    const ownerEq = jest.fn(() => ({ eq: statusEq }));
    const select = jest.fn(() => ({ eq: ownerEq }));
    mockFrom.mockReturnValue({ select });

    await expect(listActiveGoals('user-1')).resolves.toBe(goals);

    expect(select).toHaveBeenCalledWith('*');
    expect(ownerEq).toHaveBeenCalledWith('owner_user_id', 'user-1');
    expect(statusEq).toHaveBeenCalledWith('status', 'active');
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
  });
});
