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
    mockFrom.mockReturnValue({ upsert });

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
    mockFrom.mockReturnValue({ upsert });

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
});
