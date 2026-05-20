import { listMyChallenges } from '../challenges/api';
import { listActiveGoals } from '../goals/api';

export async function loadHome(userId: string) {
  const [challenges, goals] = await Promise.all([listMyChallenges(), listActiveGoals(userId)]);

  return { challenges, goals };
}
