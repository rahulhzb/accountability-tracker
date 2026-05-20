import { supabase } from '../../lib/supabase';

export type FeedEvent = {
  id: string;
  challenge_id: string;
  actor_user_id: string;
  check_in_id: string | null;
  event_type: 'check_in_done' | 'check_in_skipped' | 'check_in_missed' | 'comment_created';
  created_at: string;
  check_ins?: {
    note: string | null;
    status: 'done' | 'skipped' | 'missed';
    local_date: string;
  } | null;
  comments?: {
    id: string;
    body: string;
    user_id: string;
    created_at: string;
  }[];
};

export async function listFeedEvents(challengeId: string) {
  const { data, error } = await supabase
    .from('feed_events')
    .select('*, check_ins(*), comments(*)')
    .eq('challenge_id', challengeId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as FeedEvent[];
}

export async function createComment(input: { feedEventId: string; userId: string; body: string }) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      body: input.body.trim(),
      feed_event_id: input.feedEventId,
      user_id: input.userId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
