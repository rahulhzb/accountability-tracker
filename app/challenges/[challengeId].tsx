import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
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
import { createComment, FeedEvent, listFeedEvents } from '@/src/features/feed/api';
import { createGoal, Goal, listActiveGoals } from '@/src/features/goals/api';

const labelByEventType = {
  check_in_done: 'Completed',
  check_in_missed: 'Missed',
  check_in_skipped: 'Skipped',
  comment_created: 'Commented',
} as const;

export default function ChallengeDetailScreen() {
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const { session } = useAuth();
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [commentByEventId, setCommentByEventId] = useState<Record<string, string>>({});
  const [goalTitle, setGoalTitle] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('21:00');
  const [loading, setLoading] = useState(true);
  const [creatingGoal, setCreatingGoal] = useState(false);
  const [commentingEventId, setCommentingEventId] = useState<string | null>(null);

  async function loadChallenge(shouldApply = () => true) {
    if (!challengeId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [nextEvents, nextGoals] = await Promise.all([
        listFeedEvents(challengeId),
        session?.user.id
          ? listActiveGoals(session.user.id, { challengeId, type: 'challenge' })
          : Promise.resolve([]),
      ]);

      if (shouldApply()) {
        setEvents(nextEvents);
        setGoals(nextGoals);
      }
    } catch (error) {
      if (shouldApply()) {
        Alert.alert(
          'Could not load challenge',
          error instanceof Error ? error.message : 'Try again.',
        );
      }
    } finally {
      if (shouldApply()) {
        setLoading(false);
      }
    }
  }

  async function submitComment(feedEventId: string) {
    if (!session?.user.id) {
      Alert.alert('Sign in required', 'You need an account before commenting.');
      return;
    }

    const body = commentByEventId[feedEventId]?.trim() ?? '';

    if (!body) {
      Alert.alert('Comment required', 'Write a response before posting.');
      return;
    }

    setCommentingEventId(feedEventId);

    try {
      await createComment({ body, feedEventId, userId: session.user.id });
      setCommentByEventId((current) => ({ ...current, [feedEventId]: '' }));
      await loadChallenge();
    } catch (error) {
      Alert.alert('Could not post comment', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setCommentingEventId(null);
    }
  }

  async function addChallengeGoal() {
    if (!challengeId) {
      return;
    }

    if (!goalTitle.trim()) {
      Alert.alert('Goal required', 'Write the daily commitment for this challenge.');
      return;
    }

    setCreatingGoal(true);

    try {
      await createGoal({
        challengeId,
        deadlineTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        title: goalTitle,
      });
      setGoalTitle('');
      Alert.alert('Goal created', 'This challenge goal is ready for daily check-ins.');
      await loadChallenge();
    } catch (error) {
      Alert.alert('Could not add goal', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setCreatingGoal(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      let active = true;

      void loadChallenge(() => active);

      return () => {
        active = false;
      };
    }, [challengeId, session?.user.id]),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Challenge</Text>
      <Text style={styles.title}>Feed</Text>

      <View style={styles.goalCard}>
        <Text style={styles.goalCardTitle}>Add a group goal</Text>
        <TextInput
          onChangeText={setGoalTitle}
          placeholder="Daily group commitment"
          style={styles.input}
          value={goalTitle}
        />
        <TextInput
          keyboardType="numbers-and-punctuation"
          onChangeText={setDeadlineTime}
          placeholder="Deadline HH:mm"
          style={styles.input}
          value={deadlineTime}
        />
        <Button
          disabled={creatingGoal}
          onPress={() => void addChallengeGoal()}
          title={creatingGoal ? 'Adding...' : 'Add group goal'}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your goals in this challenge</Text>
        {goals.length === 0 ? (
          <Text style={styles.empty}>No challenge goals yet.</Text>
        ) : (
          goals.map((goal) => (
            <View key={goal.id} style={styles.goalRow}>
              <View style={styles.goalText}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.eventMeta}>Deadline {goal.deadline_time}</Text>
                {goal.today_check_in ? (
                  <Text style={styles.statusBadge}>
                    {goal.today_check_in.status === 'done'
                      ? 'Done today'
                      : goal.today_check_in.status === 'skipped'
                        ? 'Skipped today'
                        : 'Missed today'}
                  </Text>
                ) : null}
              </View>
              <Pressable
                onPress={() =>
                  router.push({
                    params: { goalId: goal.id, timezone: goal.timezone },
                    pathname: '/check-ins/[goalId]',
                  })
                }
                style={styles.checkInButton}>
                <Text style={styles.checkInButtonText}>
                  {goal.today_check_in ? 'Update' : 'Check in'}
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.empty}>No check-ins yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              <Text style={styles.eventLabel}>{labelByEventType[item.event_type]}</Text>
              <Text style={styles.eventMeta}>{item.check_ins?.local_date ?? 'Today'}</Text>
              {item.check_ins?.note ? (
                <Text style={styles.note}>{item.check_ins.note}</Text>
              ) : null}
              {item.comments?.map((comment) => (
                <Text key={comment.id} style={styles.comment}>
                  {comment.body}
                </Text>
              ))}
              <TextInput
                onChangeText={(text) =>
                  setCommentByEventId((current) => ({ ...current, [item.id]: text }))
                }
                placeholder="Write a response"
                style={styles.input}
                value={commentByEventId[item.id] ?? ''}
              />
              <Button
                disabled={commentingEventId === item.id}
                onPress={() => void submitComment(item.id)}
                title="Comment"
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  comment: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    color: '#1E293B',
    padding: 10,
  },
  container: {
    flex: 1,
    gap: 14,
    padding: 20,
    paddingTop: 72,
  },
  empty: {
    color: '#64748B',
    paddingVertical: 24,
  },
  eventCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    gap: 10,
    marginBottom: 14,
    padding: 16,
  },
  eventLabel: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',
  },
  eventMeta: {
    color: '#64748B',
  },
  eyebrow: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  input: {
    borderColor: '#CBD5E1',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  goalCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    gap: 10,
    padding: 16,
  },
  goalCardTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  goalRow: {
    alignItems: 'center',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  goalText: {
    flex: 1,
    gap: 4,
  },
  goalTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '700',
  },
  note: {
    color: '#334155',
    fontSize: 16,
    lineHeight: 22,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 20,
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
    fontSize: 34,
    fontWeight: '800',
  },
});
