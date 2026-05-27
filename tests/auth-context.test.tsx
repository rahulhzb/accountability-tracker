import { act, renderHook, waitFor } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';

import { AuthProvider, useAuth } from '../src/features/auth/auth-context';
import { getProfile } from '../src/features/profile/api';
import { supabase } from '../src/lib/supabase';

const mockGetSession = supabase.auth.getSession as jest.Mock;
const mockOnAuthStateChange = supabase.auth.onAuthStateChange as jest.Mock;
const mockGetProfile = getProfile as jest.Mock;
const mockUnsubscribe = jest.fn();

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

jest.mock('../src/features/profile/api', () => ({
  getProfile: jest.fn(),
}));

function wrapper({ children }: PropsWithChildren) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUnsubscribe.mockClear();
    mockGetProfile.mockResolvedValue({
      display_name: 'Rahul',
      id: 'user-1',
      notification_preferences: { comments: true, misses: true, reminders: true },
      timezone: 'Asia/Kolkata',
    });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
  });

  it('loads the existing Supabase session on mount', async () => {
    const session = { user: { id: 'user-1' } };
    mockGetSession.mockResolvedValue({ data: { session } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.session).toBe(session);
    expect(result.current.profile?.display_name).toBe('Rahul');
    expect(mockGetProfile).toHaveBeenCalledWith('user-1');
  });

  it('updates the session when Supabase auth state changes', async () => {
    let authStateCallback: (_event: string, session: unknown) => void = () => {};
    const nextSession = { user: { id: 'user-2' } };
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback;

      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      authStateCallback('SIGNED_IN', nextSession);
    });

    expect(result.current.session).toBe(nextSession);
  });

  it('exposes refreshProfile for onboarding after profile creation', async () => {
    const session = { user: { id: 'user-1' } };
    const nextProfile = {
      display_name: 'Updated',
      id: 'user-1',
      notification_preferences: { comments: true, misses: true, reminders: true },
      timezone: 'Asia/Kolkata',
    };
    mockGetSession.mockResolvedValue({ data: { session } });
    mockGetProfile.mockResolvedValueOnce(null).mockResolvedValueOnce(nextProfile);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refreshProfile();
    });

    expect(result.current.profile).toBe(nextProfile);
  });
});
