import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton, AppCard, AppInput, AppScreen, Eyebrow } from '@/components/app-ui';
import { design } from '@/src/design/theme';
import { useAuth } from '@/src/features/auth/auth-context';
import { updateProfile } from '@/src/features/profile/api';

function deviceTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export default function OnboardingScreen() {
  const { refreshProfile, session } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [savingDestination, setSavingDestination] = useState<string | null>(null);

  async function completeOnboarding(destination: string) {
    if (!session?.user.id) {
      Alert.alert('Sign in required', 'Create an account before setting up your profile.');
      return;
    }

    if (!displayName.trim()) {
      Alert.alert('Name required', 'Add the name your friends will see.');
      return;
    }

    setSavingDestination(destination);

    try {
      await updateProfile({
        displayName,
        timezone: deviceTimeZone(),
        userId: session.user.id,
      });
      await refreshProfile();
      router.replace(destination);
    } catch (error) {
      Alert.alert('Could not save profile', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setSavingDestination(null);
    }
  }

  return (
    <AppScreen style={styles.container}>
      <View style={styles.hero}>
        <Eyebrow>Start here</Eyebrow>
        <Text style={styles.title}>Set up your accountability loop.</Text>
        <Text style={styles.subtitle}>
          Add the name your friends will see, then choose how you want to begin.
        </Text>
      </View>

      <AppCard style={styles.card}>
        <AppInput
          autoCapitalize="words"
          onChangeText={setDisplayName}
          placeholder="Display name"
          value={displayName}
        />

        <AppButton
          disabled={savingDestination !== null}
          onPress={() => void completeOnboarding('/challenges/new')}
          title={
            savingDestination === '/challenges/new' ? 'Saving...' : 'Create a friend challenge'
          }
        />
        <AppButton
          disabled={savingDestination !== null}
          onPress={() => void completeOnboarding('/(tabs)/challenges')}
          title="Join with invite"
          variant="secondary"
        />
        <AppButton
          disabled={savingDestination !== null}
          onPress={() => void completeOnboarding('/(tabs)/personal')}
          title="Start personal tracker"
          variant="ghost"
        />
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
    justifyContent: 'center',
    padding: 24,
  },
  hero: {
    gap: 10,
    marginBottom: 22,
  },
  subtitle: {
    color: design.color.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  title: {
    color: design.color.ink,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1.4,
    lineHeight: 42,
  },
});
