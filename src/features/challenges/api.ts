import { supabase } from '../../lib/supabase';

export type Challenge = {
  id: string;
  name: string;
  description: string;
  invite_code: string;
  start_date: string;
  end_date: string | null;
  created_by: string;
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

export async function joinChallengeByInvite(inviteCode: string) {
  const { data, error } = await supabase.rpc('join_challenge_by_invite_code', {
    target_invite_code: normalizeInviteCode(inviteCode),
  });

  if (error) {
    throw error;
  }

  return data as Challenge;
}
