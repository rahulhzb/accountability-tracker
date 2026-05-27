import { supabase } from '../../lib/supabase';

export type ChallengeMember = {
  displayName: string;
  joinedAt: string;
  role: 'owner' | 'member';
  timezone: string;
  userId: string;
};

type ChallengeMemberRow = {
  joined_at: string;
  profiles: {
    display_name: string;
    timezone: string;
  } | {
    display_name: string;
    timezone: string;
  }[] | null;
  role: ChallengeMember['role'];
  user_id: string;
};

function memberProfile(row: ChallengeMemberRow) {
  return Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
}

export async function listChallengeMembers(challengeId: string) {
  const { data, error } = await supabase
    .from('challenge_members')
    .select('user_id, role, joined_at, profiles!challenge_members_user_id_fkey(display_name, timezone)')
    .order('joined_at', { ascending: true })
    .eq('challenge_id', challengeId);

  if (error) {
    throw error;
  }

  return ((data ?? []) as ChallengeMemberRow[]).map((member) => {
    const profile = memberProfile(member);

    return {
      displayName: profile?.display_name ?? 'Accountability partner',
      joinedAt: member.joined_at,
      role: member.role,
      timezone: profile?.timezone ?? 'UTC',
      userId: member.user_id,
    };
  });
}
