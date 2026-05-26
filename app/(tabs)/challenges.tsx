import { Link, router, useFocusEffect } from 'expo-router';
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

import { AppButton, AppCard, AppInput, AppScreen, Eyebrow } from '@/components/app-ui';
import { design } from '@/src/design/theme';
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
    <AppScreen style={styles.container}>
      <View style={styles.header}>
        <View>
          <Eyebrow>Private groups</Eyebrow>
          <Text style={styles.title}>Challenges</Text>
          <Text style={styles.subtitle}>Build a small circle where commitments stay visible.</Text>
        </View>
        <Link asChild href="/challenges/new">
          <AppButton title="New" />
        </Link>
      </View>

      <AppCard style={styles.card}>
        <Text style={styles.cardTitle}>Join with invite</Text>
        <AppInput
          autoCapitalize="characters"
          onChangeText={setInviteCode}
          placeholder="Invite code"
          value={inviteCode}
        />
        <AppButton
          disabled={joining}
          onPress={joinChallenge}
          title={joining ? 'Joining...' : 'Join challenge'}
          variant="secondary"
        />
      </AppCard>

      {loading ? (
        <ActivityIndicator color={design.color.teal} />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
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
              style={styles.pressable}>
              <AppCard style={styles.challengeRow}>
                <Text style={styles.challengeName}>{item.name}</Text>
                <Text style={styles.inviteCode}>Invite: {item.invite_code}</Text>
              </AppCard>
            </Pressable>
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
    fontSize: 18,
    fontWeight: '900',
  },
  challengeName: {
    color: design.color.ink,
    fontSize: 19,
    fontWeight: '900',
  },
  challengeRow: {
    gap: 6,
    padding: 18,
  },
  container: {
    gap: 18,
    padding: 20,
    paddingTop: 66,
  },
  empty: {
    color: design.color.muted,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  inviteCode: {
    color: design.color.muted,
  },
  list: {
    paddingBottom: 28,
  },
  pressable: {
    marginBottom: 12,
  },
  subtitle: {
    color: design.color.muted,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 5,
    maxWidth: 240,
  },
  title: {
    color: design.color.ink,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
});
