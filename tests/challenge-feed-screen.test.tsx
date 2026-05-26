import { fireEvent, render, waitFor } from '@testing-library/react-native';

import ChallengeDetailScreen from '../app/challenges/[challengeId]';
import { useAuth } from '../src/features/auth/auth-context';
import { createComment, listFeedEvents } from '../src/features/feed/api';
import { createGoal } from '../src/features/goals/api';

jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void) => {
    const { useEffect } = require('react');

    useEffect(() => callback(), [callback]);
  },
  useLocalSearchParams: () => ({ challengeId: 'challenge-1' }),
}));

jest.mock('../src/features/auth/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../src/features/feed/api', () => ({
  createComment: jest.fn(),
  listFeedEvents: jest.fn(),
}));

jest.mock('../src/features/goals/api', () => ({
  createGoal: jest.fn(),
}));

describe('challenge feed screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ session: { user: { id: 'user-1' } } });
  });

  it('renders feed events and creates comments', async () => {
    (listFeedEvents as jest.Mock).mockResolvedValue([
      {
        id: 'event-1',
        event_type: 'check_in_done',
        check_ins: { local_date: '2026-05-18', note: 'Finished early', status: 'done' },
        comments: [{ id: 'comment-1', body: 'Nice', user_id: 'user-2' }],
      },
    ]);
    (createComment as jest.Mock).mockResolvedValue({ id: 'comment-2' });
    const screen = render(<ChallengeDetailScreen />);

    expect(await screen.findByText('Completed')).toBeTruthy();
    expect(screen.getByText('Finished early')).toBeTruthy();
    expect(screen.getByText('Nice')).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText('Write a response'), 'Proud of you');
    fireEvent.press(screen.getByText('Comment'));

    await waitFor(() =>
      expect(createComment).toHaveBeenCalledWith({
        body: 'Proud of you',
        feedEventId: 'event-1',
        userId: 'user-1',
      }),
    );
  });

  it('creates challenge goals from the feed screen', async () => {
    (listFeedEvents as jest.Mock).mockResolvedValue([]);
    (createGoal as jest.Mock).mockResolvedValue({ id: 'goal-1' });
    const screen = render(<ChallengeDetailScreen />);

    await screen.findByText('No check-ins yet.');

    fireEvent.changeText(screen.getByPlaceholderText('Daily group commitment'), 'Walk 30 minutes');
    fireEvent.changeText(screen.getByPlaceholderText('Deadline HH:mm'), '20:30');
    fireEvent.press(screen.getByText('Add group goal'));

    await waitFor(() =>
      expect(createGoal).toHaveBeenCalledWith({
        challengeId: 'challenge-1',
        deadlineTime: '20:30',
        timezone: expect.any(String),
        title: 'Walk 30 minutes',
      }),
    );
  });
});
