import { createComment, listFeedEvents } from '../src/features/feed/api';
import { supabase } from '../src/lib/supabase';

const mockFrom = supabase.from as jest.Mock;

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('feed api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists feed events for a challenge newest first', async () => {
    const events = [{ id: 'event-1', event_type: 'check_in_done' }];
    const order = jest.fn().mockResolvedValue({ data: events, error: null });
    const eq = jest.fn(() => ({ order }));
    const select = jest.fn(() => ({ eq }));
    mockFrom.mockReturnValue({ select });

    await expect(listFeedEvents('challenge-1')).resolves.toBe(events);

    expect(mockFrom).toHaveBeenCalledWith('feed_events');
    expect(select).toHaveBeenCalledWith('*, check_ins(*), comments(*)');
    expect(eq).toHaveBeenCalledWith('challenge_id', 'challenge-1');
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('creates a trimmed comment on a feed event', async () => {
    const comment = { id: 'comment-1', body: 'Nice work' };
    const single = jest.fn().mockResolvedValue({ data: comment, error: null });
    const select = jest.fn(() => ({ single }));
    const insert = jest.fn(() => ({ select }));
    mockFrom.mockReturnValue({ insert });

    await expect(
      createComment({ body: ' Nice work ', feedEventId: 'event-1', userId: 'user-1' }),
    ).resolves.toBe(comment);

    expect(mockFrom).toHaveBeenCalledWith('comments');
    expect(insert).toHaveBeenCalledWith({
      body: 'Nice work',
      feed_event_id: 'event-1',
      user_id: 'user-1',
    });
  });
});
