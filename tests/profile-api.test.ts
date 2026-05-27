import { getProfile, updateProfile } from '../src/features/profile/api';
import { supabase } from '../src/lib/supabase';

const mockFrom = supabase.from as jest.Mock;

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('profile api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads a profile for the signed-in user', async () => {
    const profile = {
      display_name: 'Rahul',
      id: 'user-1',
      notification_preferences: { comments: true, misses: true, reminders: true },
      timezone: 'Asia/Kolkata',
    };
    const single = jest.fn().mockResolvedValue({ data: profile, error: null });
    const eq = jest.fn(() => ({ single }));
    const select = jest.fn(() => ({ eq }));
    mockFrom.mockReturnValue({ select });

    await expect(getProfile('user-1')).resolves.toBe(profile);

    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(select).toHaveBeenCalledWith(
      'id, display_name, timezone, notification_preferences, created_at',
    );
    expect(eq).toHaveBeenCalledWith('id', 'user-1');
    expect(single).toHaveBeenCalled();
  });

  it('updates profile display name and timezone', async () => {
    const profile = {
      display_name: 'Rahul',
      id: 'user-1',
      notification_preferences: { comments: true, misses: true, reminders: true },
      timezone: 'Asia/Kolkata',
    };
    const single = jest.fn().mockResolvedValue({ data: profile, error: null });
    const select = jest.fn(() => ({ single }));
    const eq = jest.fn(() => ({ select }));
    const update = jest.fn(() => ({ eq }));
    mockFrom.mockReturnValue({ update });

    await expect(
      updateProfile({
        displayName: ' Rahul ',
        timezone: 'Asia/Kolkata',
        userId: 'user-1',
      }),
    ).resolves.toBe(profile);

    expect(update).toHaveBeenCalledWith({
      display_name: 'Rahul',
      timezone: 'Asia/Kolkata',
    });
    expect(eq).toHaveBeenCalledWith('id', 'user-1');
    expect(select).toHaveBeenCalledWith(
      'id, display_name, timezone, notification_preferences, created_at',
    );
  });

  it('rejects empty display names before writing to the database', async () => {
    await expect(
      updateProfile({
        displayName: '   ',
        timezone: 'Asia/Kolkata',
        userId: 'user-1',
      }),
    ).rejects.toThrow('Display name is required');

    expect(mockFrom).not.toHaveBeenCalled();
  });
});
