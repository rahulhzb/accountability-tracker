import { supabase } from '../../lib/supabase';

export type NotificationPreferences = {
  comments: boolean;
  misses: boolean;
  reminders: boolean;
};

export type Profile = {
  created_at: string;
  display_name: string;
  id: string;
  notification_preferences: NotificationPreferences;
  timezone: string;
};

const profileSelect = 'id, display_name, timezone, notification_preferences, created_at';

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select(profileSelect)
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data as Profile;
}

export async function updateProfile(input: {
  displayName: string;
  timezone: string;
  userId: string;
}) {
  const displayName = input.displayName.trim();

  if (!displayName) {
    throw new Error('Display name is required');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      timezone: input.timezone,
    })
    .eq('id', input.userId)
    .select(profileSelect)
    .single();

  if (error) {
    throw error;
  }

  return data as Profile;
}
