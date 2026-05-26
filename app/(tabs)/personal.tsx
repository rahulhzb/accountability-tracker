import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

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
      const nextGoals = await listActiveGoals(session.user.id);

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
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Personal tracker</Text>
      <Text style={styles.title}>Daily promises</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add a daily goal</Text>
        <TextInput
          onChangeText={setTitle}
          placeholder="Daily goal"
          style={styles.input}
          value={title}
        />
        <TextInput
          keyboardType="numbers-and-punctuation"
          onChangeText={setDeadlineTime}
          placeholder="Deadline HH:mm"
          style={styles.input}
          value={deadlineTime}
        />
        <Button disabled={creating} onPress={addGoal} title={creating ? 'Adding...' : 'Add goal'} />
      </View>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.empty}>No active goals yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.goalRow}>
              <View style={styles.goalText}>
                <Text style={styles.goalTitle}>{item.title}</Text>
                <Text style={styles.goalMeta}>Deadline {item.deadline_time}</Text>
                {item.today_check_in ? (
                  <Text style={styles.statusBadge}>
                    {item.today_check_in.status === 'done'
                      ? 'Done today'
                      : item.today_check_in.status === 'skipped'
                        ? 'Skipped today'
                        : 'Missed today'}
                  </Text>
                ) : null}
              </View>
              <Pressable
                onPress={() =>
                  router.push({
                    params: { goalId: item.id, timezone: item.timezone },
                    pathname: '/check-ins/[goalId]',
                  })
                }
                style={styles.checkInButton}>
                <Text style={styles.checkInButtonText}>
                  {item.today_check_in ? 'Update' : 'Check in'}
                </Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    gap: 10,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  checkInButton: {
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  container: {
    flex: 1,
    gap: 18,
    padding: 20,
    paddingTop: 72,
  },
  empty: {
    color: '#64748B',
    paddingVertical: 24,
  },
  eyebrow: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  goalMeta: {
    color: '#64748B',
  },
  goalRow: {
    alignItems: 'center',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  goalText: {
    flex: 1,
    gap: 4,
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  input: {
    borderColor: '#CBD5E1',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  title: {
    color: '#111827',
    fontSize: 34,
    fontWeight: '800',
  },
  statusBadge: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
