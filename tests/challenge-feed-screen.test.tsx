import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert, Share } from 'react-native';

import ChallengeDetailScreen from '../app/challenges/[challengeId]';
import { useAuth } from '../src/features/auth/auth-context';
import { getChallenge } from '../src/features/challenges/api';
import { createComment, listFeedEvents } from '../src/features/feed/api';
import { createGoal, listActiveGoals } from '../src/features/goals/api';
import { listChallengeMembers } from '../src/features/members/api';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
  },
  useFocusEffect: (callback: () => void) => {
    const { useEffect } = require('react');

    useEffect(() => callback(), [callback]);
  },
  useLocalSearchParams: () => ({ challengeId: 'challenge-1' }),
}));

jest.mock('../src/features/auth/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../src/features/challenges/api', () => ({
  getChallenge: jest.fn(),
}));

jest.mock('../src/features/feed/api', () => ({
  createComment: jest.fn(),
  listFeedEvents: jest.fn(),
}));

jest.mock('../src/features/goals/api', () => ({
  createGoal: jest.fn(),
  listActiveGoals: jest.fn(),
}));

jest.mock('../src/features/members/api', () => ({
  listChallengeMembers: jest.fn(),
}));

describe('challenge feed screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction });
    (getChallenge as jest.Mock).mockResolvedValue({
      created_by: 'user-1',
      description: 'Daily movement',
      end_date: null,
      id: 'challenge-1',
      invite_code: 'ABC12345',
      name: 'Morning Fitness',
      start_date: '2026-05-19',
    });
    (useAuth as jest.Mock).mockReturnValue({ session: { user: { id: 'user-1' } } });
    (listActiveGoals as jest.Mock).mockResolvedValue([]);
    (listChallengeMembers as jest.Mock).mockResolvedValue([
      {
        displayName: 'Rahul',
        joinedAt: '2026-05-20T09:00:00Z',
        role: 'owner',
        timezone: 'Asia/Kolkata',
        userId: 'user-1',
      },
    ]);
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
    expect(listActiveGoals).toHaveBeenCalledWith('user-1', {
      challengeId: 'challenge-1',
      type: 'challenge',
    });
  });

  it('opens check-in for a challenge goal', async () => {
    (listFeedEvents as jest.Mock).mockResolvedValue([]);
    (listActiveGoals as jest.Mock).mockResolvedValue([
      {
        deadline_time: '20:30',
        id: 'goal-1',
        timezone: 'Asia/Kolkata',
        title: 'Walk 30 minutes',
        today_check_in: null,
      },
    ]);
    const screen = render(<ChallengeDetailScreen />);

    expect(await screen.findByText('Walk 30 minutes')).toBeTruthy();
    fireEvent.press(screen.getByText('Check in'));

    expect(mockPush).toHaveBeenCalledWith({
      params: { goalId: 'goal-1', timezone: 'Asia/Kolkata' },
      pathname: '/check-ins/[goalId]',
    });
  });

  it('shows challenge members and invites when the group is still solo', async () => {
    (listFeedEvents as jest.Mock).mockResolvedValue([]);
    const screen = render(<ChallengeDetailScreen />);

    expect(await screen.findByText('Members')).toBeTruthy();
    expect(screen.getByText('Rahul')).toBeTruthy();
    expect(screen.getByText('Owner')).toBeTruthy();
    expect(screen.getByText('Waiting for friends')).toBeTruthy();
    expect(screen.getByText('Invite friends')).toBeTruthy();
    expect(listChallengeMembers).toHaveBeenCalledWith('challenge-1');
  });

  it('shares the challenge invite code from the member section', async () => {
    (listFeedEvents as jest.Mock).mockResolvedValue([]);
    const screen = render(<ChallengeDetailScreen />);

    expect(await screen.findByText('Invite code ABC12345')).toBeTruthy();
    fireEvent.press(screen.getByText('Invite friends'));

    await waitFor(() =>
      expect(Share.share).toHaveBeenCalledWith({
        message: 'Join my Morning Fitness accountability challenge with invite code ABC12345.',
        title: 'Join Morning Fitness',
      }),
    );
  });

  it('shows fallback invite text when native share is unavailable', async () => {
    const originalShare = Share.share;
    (Share as unknown as { share?: typeof Share.share }).share = undefined;
    (listFeedEvents as jest.Mock).mockResolvedValue([]);

    try {
      const screen = render(<ChallengeDetailScreen />);

      expect(await screen.findByText('Invite code ABC12345')).toBeTruthy();
      fireEvent.press(screen.getByText('Invite friends'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Invite code',
        'Join my Morning Fitness accountability challenge with invite code ABC12345.',
      );
    } finally {
      Share.share = originalShare;
    }
  });
});
