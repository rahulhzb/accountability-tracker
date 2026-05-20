import { submitCheckIn } from '../src/features/check-ins/api';
import { supabase } from '../src/lib/supabase';

const mockFrom = supabase.from as jest.Mock;

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('check-ins api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-05-18T15:30:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('allows one check-in per goal per local date by upserting on the unique key', async () => {
    const checkIn = {
      id: 'check-in-1',
      goal_id: 'goal-1',
      user_id: 'user-1',
      local_date: '2026-05-18',
      status: 'done',
    };
    const single = jest.fn().mockResolvedValue({ data: checkIn, error: null });
    const select = jest.fn(() => ({ single }));
    const upsert = jest.fn(() => ({ select }));
    const goalSingle = jest.fn().mockResolvedValue({ data: { challenge_id: null }, error: null });
    const goalEq = jest.fn(() => ({ single: goalSingle }));
    const goalSelect = jest.fn(() => ({ eq: goalEq }));
    mockFrom.mockImplementation((table: string) => {
      if (table === 'check_ins') return { upsert };
      if (table === 'goals') return { select: goalSelect };
      throw new Error(`Unexpected table ${table}`);
    });

    await expect(
      submitCheckIn({
        goalId: 'goal-1',
        note: ' Finished ',
        status: 'done',
        timezone: 'Asia/Kolkata',
        userId: 'user-1',
      }),
    ).resolves.toBe(checkIn);

    expect(mockFrom).toHaveBeenCalledWith('check_ins');
    expect(upsert).toHaveBeenCalledWith(
      {
        auto_marked_missed: false,
        goal_id: 'goal-1',
        local_date: '2026-05-18',
        note: 'Finished',
        status: 'done',
        submitted_at: '2026-05-18T15:30:00.000Z',
        user_id: 'user-1',
      },
      { onConflict: 'goal_id,local_date' },
    );
  });

  it('supports skipped status and stores empty notes as null', async () => {
    const single = jest.fn().mockResolvedValue({ data: { id: 'check-in-1' }, error: null });
    const select = jest.fn(() => ({ single }));
    const upsert = jest.fn(() => ({ select }));
    const goalSingle = jest.fn().mockResolvedValue({ data: { challenge_id: null }, error: null });
    const goalEq = jest.fn(() => ({ single: goalSingle }));
    const goalSelect = jest.fn(() => ({ eq: goalEq }));
    mockFrom.mockImplementation((table: string) => {
      if (table === 'check_ins') return { upsert };
      if (table === 'goals') return { select: goalSelect };
      throw new Error(`Unexpected table ${table}`);
    });

    await submitCheckIn({
      goalId: 'goal-1',
      note: '   ',
      status: 'skipped',
      timezone: 'Asia/Kolkata',
      userId: 'user-1',
    });

    expect(upsert.mock.calls[0][0].status).toBe('skipped');
    expect(upsert.mock.calls[0][0].note).toBeNull();
  });

  it('creates a feed event for challenge goal check-ins', async () => {
    const checkIn = { id: 'check-in-1', goal_id: 'goal-1', status: 'done' };
    const checkInSingle = jest.fn().mockResolvedValue({ data: checkIn, error: null });
    const checkInSelect = jest.fn(() => ({ single: checkInSingle }));
    const upsert = jest.fn(() => ({ select: checkInSelect }));
    const goalSingle = jest
      .fn()
      .mockResolvedValue({ data: { challenge_id: 'challenge-1' }, error: null });
    const goalEq = jest.fn(() => ({ single: goalSingle }));
    const goalSelect = jest.fn(() => ({ eq: goalEq }));
    const feedUpsert = jest.fn().mockResolvedValue({ error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'check_ins') return { upsert };
      if (table === 'goals') return { select: goalSelect };
      if (table === 'feed_events') return { upsert: feedUpsert };
      throw new Error(`Unexpected table ${table}`);
    });

    await submitCheckIn({
      goalId: 'goal-1',
      note: 'Finished',
      status: 'done',
      timezone: 'Asia/Kolkata',
      userId: 'user-1',
    });

    expect(feedUpsert).toHaveBeenCalledWith(
      {
        actor_user_id: 'user-1',
        challenge_id: 'challenge-1',
        check_in_id: 'check-in-1',
        event_type: 'check_in_done',
      },
      { ignoreDuplicates: true, onConflict: 'check_in_id,event_type' },
    );
  });
});
