import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from './supabase';

function getEasProjectId() {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID
  );
}

export async function registerPushToken(userId: string) {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = getEasProjectId();

  if (!projectId) {
    throw new Error('Missing Expo EAS project ID for push notifications');
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  const { error } = await supabase.from('device_tokens').upsert(
    {
      expo_push_token: token.data,
      last_seen_at: new Date().toISOString(),
      platform: Platform.OS,
      user_id: userId,
    },
    { onConflict: 'user_id,expo_push_token' },
  );

  if (error) {
    throw error;
  }

  return token.data;
}
