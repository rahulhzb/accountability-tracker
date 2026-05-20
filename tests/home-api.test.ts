import { listMyChallenges } from '../src/features/challenges/api';
import { listActiveGoals } from '../src/features/goals/api';
import { loadHome } from '../src/features/home/api';

jest.mock('../src/features/challenges/api', () => ({
  listMyChallenges: jest.fn(),
}));

jest.mock('../src/features/goals/api', () => ({
  listActiveGoals: jest.fn(),
}));

describe('home api', () => {
  it('loads active challenges and goals for the signed-in user', async () => {
    const challenges = [{ id: 'challenge-1' }];
    const goals = [{ id: 'goal-1' }];
    jest.mocked(listMyChallenges).mockResolvedValue(challenges as never);
    jest.mocked(listActiveGoals).mockResolvedValue(goals as never);

    await expect(loadHome('user-1')).resolves.toEqual({ challenges, goals });

    expect(listMyChallenges).toHaveBeenCalled();
    expect(listActiveGoals).toHaveBeenCalledWith('user-1');
  });
});
