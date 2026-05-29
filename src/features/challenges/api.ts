import { supabase } from '../../lib/supabase';
import { FeedEvent, listFeedEvents } from '../feed/api';
import { Goal, listActiveGoals } from '../goals/api';
import { ChallengeMember, listChallengeMembers } from '../members/api';

export type Challenge = {
  id: string;
  name: string;
  description: string;
  invite_code: string;
  start_date: string;
  end_date: string | null;
  created_by: string;
};

export type ChallengeOverview = {
  challenge: Challenge;
  goals: Goal[];
  members: ChallengeMember[];
  recentFeed: FeedEvent[];
};

function inviteCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function normalizeInviteCode(code: string) {
  return code.trim().toUpperCase();
}

export async function createChallenge(input: {
  name: string;
  description: string;
}) {
  const { data, error } = await supabase.rpc('create_private_challenge', {
    target_description: input.description.trim(),
    target_invite_code: inviteCode(),
    target_name: input.name.trim(),
  });

  if (error) {
    throw error;
  }

  return data as Challenge;
}

export async function listMyChallenges() {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as Challenge[];
}

export async function getChallenge(challengeId: string) {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', challengeId)
    .single();

  if (error) {
    throw error;
  }

  return data as Challenge;
}

export async function loadChallengeOverview(input: { challengeId: string; userId: string }) {
  const [challenge, members, goals, recentFeed] = await Promise.all([
    getChallenge(input.challengeId),
    listChallengeMembers(input.challengeId),
    listActiveGoals(input.userId, { challengeId: input.challengeId, type: 'challenge' }),
    listFeedEvents(input.challengeId),
  ]);

  return {
    challenge,
    goals,
    members,
    recentFeed,
  };
}

export async function joinChallengeByInvite(inviteCode: string) {
  const { data, error } = await supabase.rpc('join_challenge_by_invite_code', {
    target_invite_code: normalizeInviteCode(inviteCode),
  });

  if (error) {
    throw error;
  }

  return data as Challenge;
}
