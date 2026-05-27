import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard, AppScreen, Eyebrow, StatusPill } from '@/components/app-ui';
import { design } from '@/src/design/theme';
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
  const completedCount = goals.filter((goal) => goal.today_check_in?.status === 'done').length;
  const pendingCount = Math.max(goals.length - completedCount, 0);

  return (
    <AppScreen style={styles.container}>
      <View style={styles.hero}>
        <Eyebrow>Today</Eyebrow>
        <Text style={styles.title}>Keep your word</Text>
        <Text style={styles.subtitle}>A clear view of today's promises and the people counting with you.</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>done</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statLabel}>open</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={design.color.teal} />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={items}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
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
              const status = item.goal.today_check_in?.status ?? 'pending';
              return (
                <Pressable
                  onPress={() =>
                    router.push({
                      params: { goalId: item.goal.id, timezone: item.goal.timezone },
                      pathname: '/check-ins/[goalId]',
                    })
                  }
                  style={styles.pressable}>
                  <AppCard style={styles.card}>
                    <View style={styles.cardTopline}>
                      <Text style={styles.cardTitle}>{item.goal.title}</Text>
                      <StatusPill status={status} />
                    </View>
                    <Text style={styles.cardMeta}>Deadline {item.goal.deadline_time}</Text>
                  </AppCard>
                </Pressable>
              );
            }

            if (item.type === 'challenge') {
              return (
                <Pressable
                  onPress={() => router.push(`/challenges/${item.challenge.id}`)}
                  style={styles.pressable}>
                  <AppCard style={styles.challengeCard}>
                    <Text style={styles.cardTitle}>{item.challenge.name}</Text>
                    <Text style={styles.cardMeta}>Invite {item.challenge.invite_code}</Text>
                  </AppCard>
                </Pressable>
              );
            }

            if (item.type === 'empty-goals') {
              return (
                <AppCard style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>Start with friends</Text>
                  <Text style={styles.empty}>
                    Create or join a private challenge to make today visible.
                  </Text>
                  <View style={styles.emptyActions}>
                    <Pressable onPress={() => router.push('/challenges/new')} style={styles.emptyButton}>
                      <Text style={styles.emptyButtonText}>Create challenge</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => router.push('/(tabs)/challenges')}
                      style={[styles.emptyButton, styles.emptyButtonSecondary]}>
                      <Text style={[styles.emptyButtonText, styles.emptyButtonTextSecondary]}>
                        Join a challenge
                      </Text>
                    </Pressable>
                  </View>
                </AppCard>
              );
            }

            if (item.type === 'empty-challenges') {
              return (
                <AppCard style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No groups yet</Text>
                  <Text style={styles.empty}>
                    Friend groups are where accountability gets real. Invite one person to start.
                  </Text>
                </AppCard>
              );
            }

            return null;
          }}
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
    padding: 18,
  },
  cardTopline: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  cardMeta: {
    color: design.color.muted,
    fontSize: 14,
  },
  cardTitle: {
    color: design.color.ink,
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
  },
  challengeCard: {
    gap: 6,
    padding: 18,
  },
  container: {
    padding: 20,
    paddingTop: 66,
  },
  empty: {
    color: design.color.muted,
    lineHeight: 20,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  emptyButton: {
    backgroundColor: design.color.primary,
    borderRadius: design.radius.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  emptyButtonSecondary: {
    backgroundColor: design.color.wash,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  emptyButtonTextSecondary: {
    color: design.color.primary,
  },
  emptyCard: {
    gap: 8,
    marginBottom: 12,
    padding: 18,
  },
  emptyTitle: {
    color: design.color.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  hero: {
    backgroundColor: design.color.primary,
    borderRadius: design.radius.xl,
    gap: 10,
    marginBottom: 8,
    overflow: 'hidden',
    padding: 22,
  },
  list: {
    paddingBottom: 28,
  },
  pressable: {
    marginBottom: 12,
  },
  sectionHeader: {
    gap: 4,
    marginBottom: 12,
    marginTop: 22,
  },
  sectionSubtitle: {
    color: design.color.muted,
  },
  sectionTitle: {
    color: design.color.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  statBlock: {
    flex: 1,
  },
  statDivider: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    width: 1,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statsRow: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: design.radius.lg,
    flexDirection: 'row',
    gap: 18,
    marginTop: 8,
    padding: 16,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 16,
    lineHeight: 23,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
});
