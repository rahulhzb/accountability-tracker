import { fireEvent, render, waitFor } from '@testing-library/react-native';

import PersonalScreen from '../app/(tabs)/personal';
import CheckInScreen from '../app/check-ins/[goalId]';
import { useAuth } from '../src/features/auth/auth-context';
import { submitCheckIn } from '../src/features/check-ins/api';
import { createGoal, listActiveGoals } from '../src/features/goals/api';

const mockPush = jest.fn();
let mockParams: Record<string, string> = { goalId: 'goal-1' };

jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    back: jest.fn(),
  },
  useFocusEffect: (callback: () => void) => {
    const { useEffect } = require('react');

    useEffect(() => callback(), [callback]);
  },
  useLocalSearchParams: () => mockParams,
}));

jest.mock('../src/features/auth/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../src/features/goals/api', () => ({
  createGoal: jest.fn(),
  listActiveGoals: jest.fn(),
}));

jest.mock('../src/features/check-ins/api', () => ({
  submitCheckIn: jest.fn(),
}));

describe('personal tracker screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = { goalId: 'goal-1' };
    (useAuth as jest.Mock).mockReturnValue({
      session: { user: { id: 'user-1' } },
    });
  });

  it('creates a personal goal and reloads the goal list', async () => {
    (listActiveGoals as jest.Mock).mockResolvedValue([]);
    (createGoal as jest.Mock).mockResolvedValue({ id: 'goal-1' });
    const screen = render(<PersonalScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Daily goal'), 'Read 20 pages');
    fireEvent.changeText(screen.getByPlaceholderText('Deadline HH:mm'), '21:30');
    fireEvent.press(screen.getByText('Add goal'));

    await waitFor(() =>
      expect(createGoal).toHaveBeenCalledWith({
        challengeId: null,
        deadlineTime: '21:30',
        timezone: expect.any(String),
        title: 'Read 20 pages',
      }),
    );
    expect(listActiveGoals).toHaveBeenCalledWith('user-1');
  });

  it('opens a goal check-in screen from the personal tracker', async () => {
    (listActiveGoals as jest.Mock).mockResolvedValue([
      {
        id: 'goal-1',
        title: 'Read 20 pages',
        deadline_time: '21:30',
        timezone: 'Asia/Kolkata',
        today_check_in: { id: 'check-in-1', local_date: '2026-05-26', status: 'done' },
      },
    ]);
    const screen = render(<PersonalScreen />);

    expect(await screen.findByText('Read 20 pages')).toBeTruthy();
    expect(screen.getByText('Done today')).toBeTruthy();
    fireEvent.press(screen.getByText('Update'));

    expect(mockPush).toHaveBeenCalledWith({
      params: { goalId: 'goal-1', timezone: 'Asia/Kolkata' },
      pathname: '/check-ins/[goalId]',
    });
  });

  it('submits a done check-in with an optional note', async () => {
    mockParams = { goalId: 'goal-1', timezone: 'America/Los_Angeles' };
    (submitCheckIn as jest.Mock).mockResolvedValue({ id: 'check-in-1' });
    const screen = render(<CheckInScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Optional note'), 'Completed before dinner');
    fireEvent.press(screen.getByText('Mark done'));

    await waitFor(() =>
      expect(submitCheckIn).toHaveBeenCalledWith({
        goalId: 'goal-1',
        note: 'Completed before dinner',
        status: 'done',
        timezone: 'America/Los_Angeles',
        userId: 'user-1',
      }),
    );
  });
});
