import { Platform } from 'react-native';

import { registerPushToken } from '../src/lib/notifications';
import { supabase } from '../src/lib/supabase';

const mockFrom = supabase.from as jest.Mock;
const mockNotifications = jest.requireMock('expo-notifications') as {
  getExpoPushTokenAsync: jest.Mock;
  getPermissionsAsync: jest.Mock;
  requestPermissionsAsync: jest.Mock;
};

let mockIsDevice = true;

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    easConfig: { projectId: 'test-eas-project-id' },
    expoConfig: { extra: { eas: { projectId: 'test-eas-project-id' } } },
  },
}));

jest.mock('expo-device', () => ({
  get isDevice() {
    return mockIsDevice;
  },
}));

jest.mock('expo-notifications', () => ({
  getExpoPushTokenAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('push notification registration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-05-20T10:00:00.000Z'));
    mockIsDevice = true;
    mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockNotifications.getExpoPushTokenAsync.mockResolvedValue({ data: 'ExponentPushToken[test]' });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('skips registration on simulators and web previews', async () => {
    mockIsDevice = false;

    await expect(registerPushToken('user-1')).resolves.toBeNull();

    expect(mockNotifications.getPermissionsAsync).not.toHaveBeenCalled();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('requests permission when needed and stores the Expo token', async () => {
    mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
    const upsert = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ upsert });

    await expect(registerPushToken('user-1')).resolves.toBe('ExponentPushToken[test]');

    expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
    expect(mockNotifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
      projectId: 'test-eas-project-id',
    });
    expect(mockFrom).toHaveBeenCalledWith('device_tokens');
    expect(upsert).toHaveBeenCalledWith(
      {
        expo_push_token: 'ExponentPushToken[test]',
        last_seen_at: '2026-05-20T10:00:00.000Z',
        platform: Platform.OS,
        user_id: 'user-1',
      },
      { onConflict: 'user_id,expo_push_token' },
    );
  });

  it('does not register when notification permission is denied', async () => {
    mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' });
    mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

    await expect(registerPushToken('user-1')).resolves.toBeNull();

    expect(mockNotifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
