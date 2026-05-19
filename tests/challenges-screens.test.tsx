import { fireEvent, render, waitFor } from '@testing-library/react-native';

import ChallengesScreen from '../app/(tabs)/challenges';
import NewChallengeScreen from '../app/challenges/new';
import { useAuth } from '../src/features/auth/auth-context';
import {
  createChallenge,
  joinChallengeByInvite,
  listMyChallenges,
} from '../src/features/challenges/api';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: {
    push: (...args: unknown[]) => mockPush(...args),
  },
  useFocusEffect: (callback: () => void) => {
    const { useEffect } = require('react');

    useEffect(() => callback(), [callback]);
  },
}));

jest.mock('../src/features/auth/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../src/features/challenges/api', () => ({
  createChallenge: jest.fn(),
  joinChallengeByInvite: jest.fn(),
  listMyChallenges: jest.fn(),
}));

describe('challenge screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      session: { user: { id: 'user-1' } },
    });
  });

  it('creates a challenge from the new challenge screen', async () => {
    (createChallenge as jest.Mock).mockResolvedValue({ id: 'challenge-1' });
    const screen = render(<NewChallengeScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Challenge name'), 'Morning Fitness');
    fireEvent.changeText(screen.getByPlaceholderText('Description'), 'Daily check-ins');
    fireEvent.press(screen.getByText('Create challenge'));

    await waitFor(() =>
      expect(createChallenge).toHaveBeenCalledWith({
        description: 'Daily check-ins',
        name: 'Morning Fitness',
      }),
    );
    expect(mockPush).toHaveBeenCalledWith('/challenges/challenge-1');
  });

  it('loads challenges and joins by invite code from the tab screen', async () => {
    (listMyChallenges as jest.Mock).mockResolvedValue([
      { id: 'challenge-1', name: 'Morning Fitness', invite_code: 'ABC12345' },
    ]);
    (joinChallengeByInvite as jest.Mock).mockResolvedValue({ id: 'challenge-2' });
    const screen = render(<ChallengesScreen />);

    expect(await screen.findByText('Morning Fitness')).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText('Invite code'), ' abc12345 ');
    fireEvent.press(screen.getByText('Join challenge'));

    await waitFor(() => expect(joinChallengeByInvite).toHaveBeenCalledWith(' abc12345 '));
    expect(mockPush).toHaveBeenCalledWith('/challenges/challenge-2');
  });
});
