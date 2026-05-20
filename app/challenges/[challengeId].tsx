import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/src/features/auth/auth-context';
import { createComment, FeedEvent, listFeedEvents } from '@/src/features/feed/api';

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
  const [commentByEventId, setCommentByEventId] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [commentingEventId, setCommentingEventId] = useState<string | null>(null);

  async function loadFeed(shouldApply = () => true) {
    if (!challengeId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const nextEvents = await listFeedEvents(challengeId);

      if (shouldApply()) {
        setEvents(nextEvents);
      }
    } catch (error) {
      if (shouldApply()) {
        Alert.alert('Could not load feed', error instanceof Error ? error.message : 'Try again.');
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
      await loadFeed();
    } catch (error) {
      Alert.alert('Could not post comment', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setCommentingEventId(null);
    }
  }

  useFocusEffect(
    useCallback(() => {
      let active = true;

      void loadFeed(() => active);

      return () => {
        active = false;
      };
    }, [challengeId]),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Challenge</Text>
      <Text style={styles.title}>Feed</Text>

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
  note: {
    color: '#334155',
    fontSize: 16,
    lineHeight: 22,
  },
  title: {
    color: '#111827',
    fontSize: 34,
    fontWeight: '800',
  },
});
