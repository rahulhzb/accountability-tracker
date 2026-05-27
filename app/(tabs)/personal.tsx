import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppButton, AppCard, AppInput, AppScreen, Eyebrow, StatusPill } from '@/components/app-ui';
import { design } from '@/src/design/theme';
import { useAuth } from '@/src/features/auth/auth-context';
import { createGoal, Goal, listActiveGoals } from '@/src/features/goals/api';

function deviceTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export default function PersonalScreen() {
  const { session } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('21:00');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function loadGoals(shouldApply = () => true) {
    if (!session?.user.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const nextGoals = await listActiveGoals(session.user.id, { type: 'personal' });

      if (shouldApply()) {
        setGoals(nextGoals);
      }
    } catch (error) {
      if (shouldApply()) {
        Alert.alert('Could not load goals', error instanceof Error ? error.message : 'Try again.');
      }
    } finally {
      if (shouldApply()) {
        setLoading(false);
      }
    }
  }

  async function addGoal() {
    if (!session?.user.id) {
      Alert.alert('Sign in required', 'You need an account before creating a goal.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Goal required', 'Write the daily commitment you want to track.');
      return;
    }

    setCreating(true);

    try {
      await createGoal({
        challengeId: null,
        deadlineTime,
        timezone: deviceTimeZone(),
        title,
      });
      setTitle('');
      await loadGoals();
    } catch (error) {
      Alert.alert('Could not add goal', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setCreating(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      let active = true;

      void loadGoals(() => active);

      return () => {
        active = false;
      };
    }, [session?.user.id]),
  );

  return (
    <AppScreen style={styles.container}>
      <Eyebrow>Personal tracker</Eyebrow>
      <Text style={styles.title}>Daily promises</Text>
      <Text style={styles.subtitle}>Private commitments that stay calm, visible, and easy to update.</Text>

      <AppCard style={styles.card}>
        <Text style={styles.cardTitle}>Add a daily goal</Text>
        <AppInput
          onChangeText={setTitle}
          placeholder="Daily goal"
          value={title}
        />
        <AppInput
          keyboardType="numbers-and-punctuation"
          onChangeText={setDeadlineTime}
          placeholder="Deadline HH:mm"
          value={deadlineTime}
        />
        <AppButton disabled={creating} onPress={addGoal} title={creating ? 'Adding...' : 'Add goal'} />
      </AppCard>

      {loading ? (
        <ActivityIndicator color={design.color.teal} />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={goals}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <AppCard style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Your private backup loop</Text>
              <Text style={styles.empty}>
                Track a commitment here when it does not belong in a friend challenge.
              </Text>
            </AppCard>
          }
          renderItem={({ item }) => (
            <AppCard style={styles.goalRow}>
              <View style={styles.goalText}>
                <Text style={styles.goalTitle}>{item.title}</Text>
                <Text style={styles.goalMeta}>Deadline {item.deadline_time}</Text>
                <StatusPill status={item.today_check_in?.status ?? 'pending'} />
              </View>
              <AppButton
                onPress={() =>
                  router.push({
                    params: { goalId: item.id, timezone: item.timezone },
                    pathname: '/check-ins/[goalId]',
                  })
                }
                title={item.today_check_in ? 'Update' : 'Check in'}
              />
            </AppCard>
          )}
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 18,
  },
  cardTitle: {
    color: design.color.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  container: {
    gap: 18,
    padding: 20,
    paddingTop: 66,
  },
  empty: {
    color: design.color.muted,
    lineHeight: 20,
  },
  emptyCard: {
    gap: 8,
    padding: 18,
  },
  emptyTitle: {
    color: design.color.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  goalMeta: {
    color: design.color.muted,
  },
  goalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 16,
  },
  goalText: {
    flex: 1,
    gap: 4,
  },
  goalTitle: {
    color: design.color.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  list: {
    paddingBottom: 28,
  },
  subtitle: {
    color: design.color.muted,
    fontSize: 15,
    lineHeight: 21,
    marginTop: -10,
  },
  title: {
    color: design.color.ink,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
});
