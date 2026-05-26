import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppButton, AppCard, AppInput, AppScreen, Eyebrow, StatusPill } from '@/components/app-ui';
import { design } from '@/src/design/theme';
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
    <AppScreen style={styles.container}>
      <Eyebrow>Challenge</Eyebrow>
      <Text style={styles.title}>Feed</Text>
      <Text style={styles.subtitle}>A shared record of commitments, misses, and encouragement.</Text>

      <AppCard style={styles.goalCard}>
        <Text style={styles.goalCardTitle}>Add a group goal</Text>
        <AppInput
          onChangeText={setGoalTitle}
          placeholder="Daily group commitment"
          value={goalTitle}
        />
        <AppInput
          keyboardType="numbers-and-punctuation"
          onChangeText={setDeadlineTime}
          placeholder="Deadline HH:mm"
          value={deadlineTime}
        />
        <AppButton
          disabled={creatingGoal}
          onPress={() => void addChallengeGoal()}
          title={creatingGoal ? 'Adding...' : 'Add group goal'}
        />
      </AppCard>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your goals in this challenge</Text>
        {goals.length === 0 ? (
          <Text style={styles.empty}>No challenge goals yet.</Text>
        ) : (
          goals.map((goal) => (
            <AppCard key={goal.id} style={styles.goalRow}>
              <View style={styles.goalText}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.eventMeta}>Deadline {goal.deadline_time}</Text>
                <StatusPill status={goal.today_check_in?.status ?? 'pending'} />
              </View>
              <AppButton
                onPress={() =>
                  router.push({
                    params: { goalId: goal.id, timezone: goal.timezone },
                    pathname: '/check-ins/[goalId]',
                  })
                }
                title={goal.today_check_in ? 'Update' : 'Check in'}
              />
            </AppCard>
          ))
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={design.color.teal} />
      ) : (
        <FlatList
          contentContainerStyle={styles.feedList}
          data={events}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.empty}>No check-ins yet.</Text>}
          renderItem={({ item }) => (
            <AppCard style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventLabel}>{labelByEventType[item.event_type]}</Text>
                <Text style={styles.eventMeta}>{item.check_ins?.local_date ?? 'Today'}</Text>
              </View>
              {item.check_ins?.note ? (
                <Text style={styles.note}>{item.check_ins.note}</Text>
              ) : null}
              {item.comments?.map((comment) => (
                <Text key={comment.id} style={styles.comment}>
                  {comment.body}
                </Text>
              ))}
              <AppInput
                onChangeText={(text) =>
                  setCommentByEventId((current) => ({ ...current, [item.id]: text }))
                }
                placeholder="Write a response"
                value={commentByEventId[item.id] ?? ''}
              />
              <AppButton
                disabled={commentingEventId === item.id}
                onPress={() => void submitComment(item.id)}
                title={commentingEventId === item.id ? 'Posting...' : 'Comment'}
                variant="secondary"
              />
            </AppCard>
          )}
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  comment: {
    backgroundColor: design.color.wash,
    borderRadius: design.radius.md,
    color: design.color.inkSoft,
    padding: 10,
  },
  container: {
    gap: 14,
    padding: 20,
    paddingTop: 66,
  },
  empty: {
    color: design.color.muted,
    paddingVertical: 24,
  },
  eventCard: {
    gap: 10,
    marginBottom: 14,
    padding: 16,
  },
  eventHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventLabel: {
    color: design.color.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  eventMeta: {
    color: design.color.muted,
  },
  feedList: {
    paddingBottom: 28,
  },
  goalCard: {
    gap: 12,
    padding: 18,
  },
  goalCardTitle: {
    color: design.color.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  goalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 16,
  },
  goalText: {
    flex: 1,
    gap: 4,
  },
  goalTitle: {
    color: design.color.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  note: {
    color: design.color.inkSoft,
    fontSize: 16,
    lineHeight: 22,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: design.color.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: design.color.muted,
    fontSize: 15,
    lineHeight: 21,
  },
  title: {
    color: design.color.ink,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1.2,
  },
});
