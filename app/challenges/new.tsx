import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton, AppCard, AppInput, AppScreen, Eyebrow } from '@/components/app-ui';
import { design } from '@/src/design/theme';
import { useAuth } from '@/src/features/auth/auth-context';
import { createChallenge } from '@/src/features/challenges/api';

export default function NewChallengeScreen() {
  const { session } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!session?.user.id) {
      Alert.alert('Sign in required', 'You need an account before creating a challenge.');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Name required', 'Give your challenge a clear name.');
      return;
    }

    setLoading(true);

    try {
      const challenge = await createChallenge({
        description,
        name,
      });
      router.push(`/challenges/${challenge.id}`);
    } catch (error) {
      Alert.alert('Could not create challenge', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen style={styles.container}>
      <Eyebrow>Invite-only group</Eyebrow>
      <Text style={styles.title}>Create a challenge</Text>
      <Text style={styles.subtitle}>
        Start a private accountability group and invite friends with a code.
      </Text>
      <AppCard style={styles.card}>
        <AppInput
          onChangeText={setName}
          placeholder="Challenge name"
          value={name}
        />
        <AppInput
          multiline
          onChangeText={setDescription}
          placeholder="Description"
          value={description}
        />
        <AppButton disabled={loading} onPress={submit} title={loading ? 'Creating...' : 'Create challenge'} />
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 18,
  },
  container: {
    gap: 14,
    padding: 24,
    paddingTop: 84,
  },
  subtitle: {
    color: design.color.muted,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 8,
  },
  title: {
    color: design.color.ink,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1.2,
  },
});
