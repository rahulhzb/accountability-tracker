import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppButton, AppCard, AppInput, AppScreen, Eyebrow, StatusPill } from '@/components/app-ui';
import { design } from '@/src/design/theme';
import { useAuth } from '@/src/features/auth/auth-context';
import { Challenge, getChallenge } from '@/src/features/challenges/api';
import { createComment, FeedEvent, listFeedEvents } from '@/src/features/feed/api';
import { createGoal, Goal, listActiveGoals } from '@/src/features/goals/api';
import { ChallengeMember, listChallengeMembers } from '@/src/features/members/api';

const labelByEventType = {
  check_in_done: 'Completed',
  check_in_missed: 'Missed',
  check_in_skipped: 'Skipped',
  comment_created: 'Commented',
} as const;

export default function ChallengeDetailScreen() {
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const { session } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [members, setMembers] = useState<ChallengeMember[]>([]);
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
      const [nextChallenge, nextEvents, nextMembers, nextGoals] = await Promise.all([
        getChallenge(challengeId),
        listFeedEvents(challengeId),
        listChallengeMembers(challengeId),
        session?.user.id
          ? listActiveGoals(session.user.id, { challengeId, type: 'challenge' })
          : Promise.resolve([]),
      ]);

      if (shouldApply()) {
        setChallenge(nextChallenge);
        setEvents(nextEvents);
        setMembers(nextMembers);
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

  async function shareInvite() {
    if (!challenge) {
      Alert.alert('Invite unavailable', 'Challenge details are still loading.');
      return;
    }

    const message = `Join my ${challenge.name} accountability challenge with invite code ${challenge.invite_code}.`;

    if (typeof Share.share !== 'function') {
      Alert.alert('Invite code', message);
      return;
    }

    try {
      await Share.share({
        message,
        title: `Join ${challenge.name}`,
      });
    } catch (error) {
      Alert.alert('Could not share invite', error instanceof Error ? error.message : message);
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
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        style={styles.scroll}
        testID="challenge-detail-scroll">
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Members</Text>
            <AppButton
              onPress={() => void shareInvite()}
              title="Invite friends"
              variant="secondary"
            />
          </View>
          {challenge ? (
            <Text style={styles.inviteCode}>Invite code {challenge.invite_code}</Text>
          ) : null}
          {members.length === 1 ? (
            <Text style={styles.empty}>Waiting for friends</Text>
          ) : null}
          {members.map((member) => (
            <AppCard key={member.userId} style={styles.memberRow}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberInitial}>{member.displayName.slice(0, 1).toUpperCase()}</Text>
              </View>
              <View style={styles.memberText}>
                <Text style={styles.memberName}>{member.displayName}</Text>
                <Text style={styles.eventMeta}>{member.timezone}</Text>
              </View>
              <View style={styles.rolePill}>
                <Text style={styles.rolePillText}>{member.role === 'owner' ? 'Owner' : 'Member'}</Text>
              </View>
            </AppCard>
          ))}
        </View>

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
          <View style={styles.feedList}>
            {events.length === 0 ? <Text style={styles.empty}>No check-ins yet.</Text> : null}
            {events.map((item) => (
              <AppCard key={item.id} style={styles.eventCard}>
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
            ))}
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 48,
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
  inviteCode: {
    color: design.color.teal,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  memberAvatar: {
    alignItems: 'center',
    backgroundColor: design.color.teal,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  memberInitial: {
    color: design.color.card,
    fontSize: 16,
    fontWeight: '900',
  },
  memberName: {
    color: design.color.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  memberRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  memberText: {
    flex: 1,
    gap: 3,
  },
  note: {
    color: design.color.inkSoft,
    fontSize: 16,
    lineHeight: 22,
  },
  rolePill: {
    backgroundColor: design.color.wash,
    borderRadius: design.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  rolePillText: {
    color: design.color.teal,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  scroll: {
    flex: 1,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
