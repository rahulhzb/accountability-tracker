import {
  createChallenge,
  getChallenge,
  joinChallengeByInvite,
  loadChallengeOverview,
  listMyChallenges,
} from '../src/features/challenges/api';
import { listFeedEvents } from '../src/features/feed/api';
import { listActiveGoals } from '../src/features/goals/api';
import { listChallengeMembers } from '../src/features/members/api';
import { supabase } from '../src/lib/supabase';

const mockFrom = supabase.from as jest.Mock;
const mockRpc = supabase.rpc as jest.Mock;

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

jest.mock('../src/features/feed/api', () => ({
  listFeedEvents: jest.fn(),
}));

jest.mock('../src/features/goals/api', () => ({
  listActiveGoals: jest.fn(),
}));

jest.mock('../src/features/members/api', () => ({
  listChallengeMembers: jest.fn(),
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

  it('loads one challenge by id for invite sharing', async () => {
    const challenge = {
      id: 'challenge-1',
      name: 'Morning Fitness',
      description: '',
      invite_code: 'ABC12345',
      start_date: '2026-05-19',
      end_date: null,
      created_by: 'user-1',
    };
    const single = jest.fn().mockResolvedValue({ data: challenge, error: null });
    const eq = jest.fn(() => ({ single }));
    const select = jest.fn(() => ({ eq }));

    mockFrom.mockReturnValue({ select });

    await expect(getChallenge('challenge-1')).resolves.toBe(challenge);

    expect(mockFrom).toHaveBeenCalledWith('challenges');
    expect(select).toHaveBeenCalledWith('*');
    expect(eq).toHaveBeenCalledWith('id', 'challenge-1');
    expect(single).toHaveBeenCalled();
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

  it('loads challenge overview data for the detail hub', async () => {
    const challenge = {
      id: 'challenge-1',
      name: 'Morning Fitness',
      description: '',
      invite_code: 'ABC12345',
      start_date: '2026-05-19',
      end_date: null,
      created_by: 'user-1',
    };
    const members = [{ userId: 'user-1', role: 'owner' }];
    const goals = [{ id: 'goal-1', challenge_id: 'challenge-1' }];
    const recentFeed = [{ id: 'event-1', event_type: 'check_in_done' }];
    const single = jest.fn().mockResolvedValue({ data: challenge, error: null });
    const eq = jest.fn(() => ({ single }));
    const select = jest.fn(() => ({ eq }));

    mockFrom.mockReturnValue({ select });
    jest.mocked(listChallengeMembers).mockResolvedValue(members as never);
    jest.mocked(listActiveGoals).mockResolvedValue(goals as never);
    jest.mocked(listFeedEvents).mockResolvedValue(recentFeed as never);

    await expect(
      loadChallengeOverview({ challengeId: 'challenge-1', userId: 'user-1' }),
    ).resolves.toEqual({
      challenge,
      goals,
      members,
      recentFeed,
    });

    expect(listChallengeMembers).toHaveBeenCalledWith('challenge-1');
    expect(listActiveGoals).toHaveBeenCalledWith('user-1', {
      challengeId: 'challenge-1',
      type: 'challenge',
    });
    expect(listFeedEvents).toHaveBeenCalledWith('challenge-1');
  });
});
