import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/src/features/auth/auth-context';
import { CheckInStatus, submitCheckIn } from '@/src/features/check-ins/api';

export default function CheckInScreen() {
  const { goalId, timezone } = useLocalSearchParams<{ goalId: string; timezone?: string }>();
  const { session } = useAuth();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(status: CheckInStatus) {
    if (!session?.user.id) {
      Alert.alert('Sign in required', 'You need an account before checking in.');
      return;
    }

    if (!goalId) {
      Alert.alert('Missing goal', 'Open a goal before checking in.');
      return;
    }

    if (!timezone) {
      Alert.alert('Missing timezone', 'Open this check-in from a goal so the correct day is used.');
      return;
    }

    setLoading(true);

    try {
      await submitCheckIn({
        goalId,
        note,
        status,
        timezone,
        userId: session.user.id,
      });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Could not check in', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Today</Text>
      <Text style={styles.title}>Check in</Text>
      <Text style={styles.subtitle}>Mark whether you completed this commitment today.</Text>
      <TextInput
        multiline
        onChangeText={setNote}
        placeholder="Optional note"
        style={[styles.input, styles.textArea]}
        value={note}
      />
      <Button disabled={loading} onPress={() => void submit('done')} title="Mark done" />
      <Button disabled={loading} onPress={() => void submit('skipped')} title="Skip today" />
      <Button disabled={loading} onPress={() => router.replace('/(tabs)')} title="Back to Today" />
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  title: {
    color: '#111827',
    fontSize: 34,
    fontWeight: '800',
  },
});
