import { listChallengeMembers } from '../src/features/members/api';
import { supabase } from '../src/lib/supabase';

const mockFrom = supabase.from as jest.Mock;

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('members api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists challenge members with their profile details', async () => {
    const rows = [
      {
        joined_at: '2026-05-20T09:00:00Z',
        profiles: {
          display_name: 'Rahul',
          timezone: 'Asia/Kolkata',
        },
        role: 'owner',
        user_id: 'user-1',
      },
    ];
    const eq = jest.fn().mockResolvedValue({ data: rows, error: null });
    const order = jest.fn(() => ({ eq }));
    const select = jest.fn(() => ({ order }));

    mockFrom.mockReturnValue({ select });

    await expect(listChallengeMembers('challenge-1')).resolves.toEqual([
      {
        displayName: 'Rahul',
        joinedAt: '2026-05-20T09:00:00Z',
        role: 'owner',
        timezone: 'Asia/Kolkata',
        userId: 'user-1',
      },
    ]);

    expect(mockFrom).toHaveBeenCalledWith('challenge_members');
    expect(select).toHaveBeenCalledWith(
      'user_id, role, joined_at, profiles!challenge_members_user_id_fkey(display_name, timezone)',
    );
    expect(order).toHaveBeenCalledWith('joined_at', { ascending: true });
    expect(eq).toHaveBeenCalledWith('challenge_id', 'challenge-1');
  });

  it('throws when the members query fails', async () => {
    const error = new Error('No access');
    const eq = jest.fn().mockResolvedValue({ data: null, error });
    const order = jest.fn(() => ({ eq }));
    const select = jest.fn(() => ({ order }));

    mockFrom.mockReturnValue({ select });

    await expect(listChallengeMembers('challenge-1')).rejects.toThrow(error);
  });
});
