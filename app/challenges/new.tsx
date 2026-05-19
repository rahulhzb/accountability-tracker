import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

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
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Invite-only group</Text>
      <Text style={styles.title}>Create a challenge</Text>
      <Text style={styles.subtitle}>
        Start a private accountability group and invite friends with a code.
      </Text>
      <TextInput
        onChangeText={setName}
        placeholder="Challenge name"
        style={styles.input}
        value={name}
      />
      <TextInput
        multiline
        onChangeText={setDescription}
        placeholder="Description"
        style={[styles.input, styles.textArea]}
        value={description}
      />
      <Button disabled={loading} onPress={submit} title={loading ? 'Creating...' : 'Create challenge'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
    padding: 24,
    paddingTop: 84,
  },
  eyebrow: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  input: {
    borderColor: '#CBD5E1',
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  subtitle: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 8,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  title: {
    color: '#111827',
    fontSize: 34,
    fontWeight: '800',
  },
});
