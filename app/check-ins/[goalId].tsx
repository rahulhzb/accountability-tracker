import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton, AppCard, AppInput, AppScreen, Eyebrow } from '@/components/app-ui';
import { design } from '@/src/design/theme';
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
    <AppScreen style={styles.container}>
      <View style={styles.hero}>
        <Eyebrow>Today</Eyebrow>
        <Text style={styles.title}>Check in</Text>
        <Text style={styles.subtitle}>Choose the honest status. A short note is optional.</Text>
      </View>
      <AppCard style={styles.card}>
        <AppInput
          multiline
          onChangeText={setNote}
          placeholder="Optional note"
          value={note}
        />
        <View style={styles.actions}>
          <AppButton disabled={loading} onPress={() => void submit('done')} title="Mark done" />
          <AppButton
            disabled={loading}
            onPress={() => void submit('skipped')}
            title="Skip today"
            variant="secondary"
          />
          <AppButton
            disabled={loading}
            onPress={() => router.replace('/(tabs)')}
            title="Back to Today"
            variant="ghost"
          />
        </View>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 10,
  },
  card: {
    gap: 16,
    padding: 18,
  },
  container: {
    gap: 18,
    padding: 24,
    paddingTop: 84,
  },
  hero: {
    gap: 8,
  },
  subtitle: {
    color: design.color.muted,
    fontSize: 17,
    lineHeight: 24,
  },
  title: {
    color: design.color.ink,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1.4,
  },
});
