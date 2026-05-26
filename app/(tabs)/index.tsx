import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/src/features/auth/auth-context';
import { Challenge } from '@/src/features/challenges/api';
import { Goal } from '@/src/features/goals/api';
import { loadHome } from '@/src/features/home/api';

type HomeItem =
  | { type: 'header'; id: string; title: string; subtitle: string }
  | { type: 'goal'; id: string; goal: Goal }
  | { type: 'empty-goals'; id: string }
  | { type: 'challenge'; id: string; challenge: Challenge }
  | { type: 'empty-challenges'; id: string };

function buildHomeItems(goals: Goal[], challenges: Challenge[]): HomeItem[] {
  return [
    {
      id: 'goals-header',
      subtitle: 'Check in before the deadline.',
      title: "Today's goals",
      type: 'header',
    },
    ...(goals.length
      ? goals.map((goal) => ({ goal, id: `goal-${goal.id}`, type: 'goal' as const }))
      : [{ id: 'empty-goals', type: 'empty-goals' as const }]),
    {
      id: 'challenges-header',
      subtitle: 'Private friend groups you are part of.',
      title: 'Active challenges',
      type: 'header',
    },
    ...(challenges.length
      ? challenges.map((challenge) => ({
          challenge,
          id: `challenge-${challenge.id}`,
          type: 'challenge' as const,
        }))
      : [{ id: 'empty-challenges', type: 'empty-challenges' as const }]),
  ];
}

export default function HomeScreen() {
  const { session } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboard(shouldApply = () => true) {
    if (!session?.user.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const home = await loadHome(session.user.id);

      if (shouldApply()) {
        setChallenges(home.challenges);
        setGoals(home.goals);
      }
    } catch (error) {
      if (shouldApply()) {
        Alert.alert('Could not load today', error instanceof Error ? error.message : 'Try again.');
      }
    } finally {
      if (shouldApply()) {
        setLoading(false);
      }
    }
  }

  useFocusEffect(
    useCallback(() => {
      let active = true;

      void loadDashboard(() => active);

      return () => {
        active = false;
      };
    }, [session?.user.id]),
  );

  const items = buildHomeItems(goals, challenges);

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Today</Text>
      <Text style={styles.title}>Keep your word</Text>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{item.title}</Text>
                  <Text style={styles.sectionSubtitle}>{item.subtitle}</Text>
                </View>
              );
            }

            if (item.type === 'goal') {
              return (
                <Pressable
                  onPress={() =>
                    router.push({
                      params: { goalId: item.goal.id, timezone: item.goal.timezone },
                      pathname: '/check-ins/[goalId]',
                    })
                  }
                  style={styles.card}>
                  <Text style={styles.cardTitle}>{item.goal.title}</Text>
                  <Text style={styles.cardMeta}>Deadline {item.goal.deadline_time}</Text>
                  {item.goal.today_check_in ? (
                    <Text style={styles.statusBadge}>
                      {item.goal.today_check_in.status === 'done'
                        ? 'Done today'
                        : item.goal.today_check_in.status === 'skipped'
                          ? 'Skipped today'
                          : 'Missed today'}
                    </Text>
                  ) : null}
                </Pressable>
              );
            }

            if (item.type === 'challenge') {
              return (
                <Pressable
                  onPress={() => router.push(`/challenges/${item.challenge.id}`)}
                  style={styles.card}>
                  <Text style={styles.cardTitle}>{item.challenge.name}</Text>
                  <Text style={styles.cardMeta}>Invite {item.challenge.invite_code}</Text>
                </Pressable>
              );
            }

            return (
              <Text style={styles.empty}>
                {item.type === 'empty-goals'
                  ? 'No goals yet. Add one from Personal.'
                  : 'No challenge groups yet. Create or join one from Challenges.'}
              </Text>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    marginBottom: 10,
    padding: 16,
  },
  cardMeta: {
    color: '#64748B',
  },
  cardTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '800',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 72,
  },
  empty: {
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 18,
  },
  eyebrow: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sectionHeader: {
    gap: 4,
    marginBottom: 10,
    marginTop: 24,
  },
  sectionSubtitle: {
    color: '#64748B',
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '800',
  },
  statusBadge: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#111827',
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 6,
  },
});
