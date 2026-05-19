import {
  createChallenge,
  joinChallengeByInvite,
  listMyChallenges,
} from '../src/features/challenges/api';
import { supabase } from '../src/lib/supabase';

const mockFrom = supabase.from as jest.Mock;
const mockRpc = supabase.rpc as jest.Mock;

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

describe('challenge api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a private challenge through an atomic RPC', async () => {
    const challenge = {
      id: 'challenge-1',
      name: 'Morning Fitness',
      description: 'Daily check-ins',
      invite_code: 'ABC12345',
      start_date: '2026-05-19',
      end_date: null,
      created_by: 'user-1',
    };
    mockRpc.mockResolvedValue({ data: challenge, error: null });

    await expect(
      createChallenge({
        description: ' Daily check-ins ',
        name: ' Morning Fitness ',
      }),
    ).resolves.toBe(challenge);

    expect(mockRpc).toHaveBeenCalledWith('create_private_challenge', {
      target_description: 'Daily check-ins',
      target_invite_code: expect.stringMatching(/^[A-Z0-9]{8}$/),
      target_name: 'Morning Fitness',
    });
    expect(mockFrom).not.toHaveBeenCalledWith('challenge_members');
  });

  it('lists challenges ordered newest first', async () => {
    const challenges = [{ id: 'challenge-1', name: 'Morning Fitness' }];
    const order = jest.fn().mockResolvedValue({ data: challenges, error: null });
    const select = jest.fn(() => ({ order }));

    mockFrom.mockReturnValue({ select });

    await expect(listMyChallenges()).resolves.toBe(challenges);

    expect(mockFrom).toHaveBeenCalledWith('challenges');
    expect(select).toHaveBeenCalledWith('*');
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('joins a challenge through the invite-code RPC', async () => {
    const challenge = {
      id: 'challenge-1',
      name: 'Morning Fitness',
      description: '',
      invite_code: 'ABC12345',
      start_date: '2026-05-19',
      end_date: null,
      created_by: 'user-1',
    };
    mockRpc.mockResolvedValue({ data: challenge, error: null });

    await expect(joinChallengeByInvite(' abc12345 ')).resolves.toBe(challenge);

    expect(mockRpc).toHaveBeenCalledWith('join_challenge_by_invite_code', {
      target_invite_code: 'ABC12345',
    });
  });
});
