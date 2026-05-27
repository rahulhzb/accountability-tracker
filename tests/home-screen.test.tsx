import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import HomeScreen from '../app/(tabs)';
import { loadHome } from '../src/features/home/api';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
  },
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = jest.requireActual('react');
    React.useEffect(callback, [callback]);
  },
}));

jest.mock('../src/features/auth/auth-context', () => ({
  useAuth: () => ({ session: { user: { id: 'user-1' } } }),
}));

jest.mock('../src/features/home/api', () => ({
  loadHome: jest.fn(),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows active goals and challenges, then navigates to their detail flows', async () => {
    jest.mocked(loadHome).mockResolvedValue({
      challenges: [
        {
          created_by: 'user-1',
          description: '',
          end_date: null,
          id: 'challenge-1',
          invite_code: 'ABC12345',
          name: 'Morning crew',
          start_date: '2026-05-20',
        },
      ],
      goals: [
        {
          challenge_id: null,
          deadline_time: '21:00:00',
          id: 'goal-1',
          owner_user_id: 'user-1',
          status: 'active',
          today_check_in: { id: 'check-in-1', local_date: '2026-05-26', status: 'done' },
          timezone: 'Asia/Kolkata',
          title: 'Read for 20 minutes',
        },
      ],
    });

    render(<HomeScreen />);

    await screen.findByText('Read for 20 minutes');
    expect(screen.getByText('Done today')).toBeTruthy();
    expect(screen.getByText('Morning crew')).toBeTruthy();

    fireEvent.press(screen.getByText('Read for 20 minutes'));
    expect(mockPush).toHaveBeenCalledWith({
      params: { goalId: 'goal-1', timezone: 'Asia/Kolkata' },
      pathname: '/check-ins/[goalId]',
    });

    fireEvent.press(screen.getByText('Morning crew'));
    expect(mockPush).toHaveBeenCalledWith('/challenges/challenge-1');
  });

  it('shows guided empty states when the user has no goals or challenges', async () => {
    jest.mocked(loadHome).mockResolvedValue({ challenges: [], goals: [] });

    render(<HomeScreen />);

    await waitFor(() => {
      expect(screen.getByText('Start with friends')).toBeTruthy();
      expect(screen.getByText('Create or join a private challenge to make today visible.')).toBeTruthy();
      expect(screen.getByText('Create challenge')).toBeTruthy();
      expect(screen.getByText('Join a challenge')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Create challenge'));
    expect(mockPush).toHaveBeenCalledWith('/challenges/new');

    fireEvent.press(screen.getByText('Join a challenge'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/challenges');
  });
});
