import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import OnboardingScreen from '../app/onboarding';
import { useAuth } from '../src/features/auth/auth-context';
import { updateProfile } from '../src/features/profile/api';

const mockReplace = jest.fn();

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

jest.mock('expo-router', () => ({
  router: {
    replace: (...args: unknown[]) => mockReplace(...args),
  },
}));

jest.mock('../src/features/auth/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../src/features/profile/api', () => ({
  updateProfile: jest.fn(),
}));

describe('OnboardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      profile: null,
      refreshProfile: jest.fn().mockResolvedValue(undefined),
      session: { user: { id: 'user-1' } },
    });
    (updateProfile as jest.Mock).mockResolvedValue({ id: 'user-1' });
  });

  it('saves profile and routes to challenge creation', async () => {
    const screen = render(<OnboardingScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Display name'), 'Rahul');
    fireEvent.press(screen.getByText('Create a friend challenge'));

    await waitFor(() =>
      expect(updateProfile).toHaveBeenCalledWith({
        displayName: 'Rahul',
        timezone: expect.any(String),
        userId: 'user-1',
      }),
    );
    expect(mockReplace).toHaveBeenCalledWith('/challenges/new');
  });

  it('saves profile and routes to join challenges', async () => {
    const screen = render(<OnboardingScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Display name'), 'Rahul');
    fireEvent.press(screen.getByText('Join with invite'));

    await waitFor(() => expect(updateProfile).toHaveBeenCalled());
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/challenges');
  });

  it('saves profile and routes to personal tracker', async () => {
    const screen = render(<OnboardingScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Display name'), 'Rahul');
    fireEvent.press(screen.getByText('Start personal tracker'));

    await waitFor(() => expect(updateProfile).toHaveBeenCalled());
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/personal');
  });

  it('requires a display name before continuing', () => {
    const screen = render(<OnboardingScreen />);

    fireEvent.press(screen.getByText('Create a friend challenge'));

    expect(Alert.alert).toHaveBeenCalledWith('Name required', 'Add the name your friends will see.');
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('routes already onboarded users away from onboarding', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      profile: { display_name: 'Rahul', id: 'user-1', timezone: 'Asia/Kolkata' },
      refreshProfile: jest.fn().mockResolvedValue(undefined),
      session: { user: { id: 'user-1' } },
    });

    render(<OnboardingScreen />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)'));
  });
});
