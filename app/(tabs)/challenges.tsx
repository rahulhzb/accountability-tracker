import { Link, router, useFocusEffect } from 'expo-router';
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

import {
  Challenge,
  joinChallengeByInvite,
  listMyChallenges,
} from '@/src/features/challenges/api';

export default function ChallengesScreen() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  async function loadChallenges(shouldApply = () => true) {
    setLoading(true);

    try {
      const nextChallenges = await listMyChallenges();

      if (shouldApply()) {
        setChallenges(nextChallenges);
      }
    } catch (error) {
      if (shouldApply()) {
        Alert.alert('Could not load challenges', error instanceof Error ? error.message : 'Try again.');
      }
    } finally {
      if (shouldApply()) {
        setLoading(false);
      }
    }
  }

  async function joinChallenge() {
    if (!inviteCode.trim()) {
      Alert.alert('Invite code required', 'Enter the invite code your friend shared.');
      return;
    }

    setJoining(true);

    try {
      const challenge = await joinChallengeByInvite(inviteCode);
      setInviteCode('');
      router.push(`/challenges/${challenge.id}`);
    } catch (error) {
      Alert.alert('Could not join challenge', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setJoining(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      let active = true;

      void loadChallenges(() => active);

      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Private groups</Text>
          <Text style={styles.title}>Challenges</Text>
        </View>
        <Link asChild href="/challenges/new">
          <Pressable style={styles.newButton}>
            <Text style={styles.newButtonText}>New</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Join with invite</Text>
        <TextInput
          autoCapitalize="characters"
          onChangeText={setInviteCode}
          placeholder="Invite code"
          style={styles.input}
          value={inviteCode}
        />
        <Button disabled={joining} onPress={joinChallenge} title="Join challenge" />
      </View>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Pressable onPress={() => void loadChallenges()}>
              <Text style={styles.empty}>No challenges yet. Create one.</Text>
            </Pressable>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/challenges/${item.id}`)}
              style={styles.challengeRow}>
              <Text style={styles.challengeName}>{item.name}</Text>
              <Text style={styles.inviteCode}>Invite: {item.invite_code}</Text>
            </Pressable>
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
  challengeName: {
    fontSize: 17,
    fontWeight: '700',
  },
  challengeRow: {
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    gap: 4,
    paddingVertical: 16,
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    borderColor: '#CBD5E1',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inviteCode: {
    color: '#64748B',
  },
  newButton: {
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  newButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  title: {
    color: '#111827',
    fontSize: 34,
    fontWeight: '800',
  },
});
