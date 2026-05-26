import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton, AppCard, AppInput, AppScreen, Eyebrow } from '@/components/app-ui';
import { design } from '@/src/design/theme';
import { supabase } from '../../src/lib/supabase';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert('Sign in failed', error.message);
    }
  }

  async function signUp() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert('Sign up failed', error.message);
      return;
    }

    Alert.alert('Check your email', 'Confirm your account before signing in.');
  }

  return (
    <AppScreen style={styles.container}>
      <View style={styles.hero}>
        <Eyebrow>Private accountability</Eyebrow>
        <Text style={styles.title}>Keep promises with people who care.</Text>
        <Text style={styles.subtitle}>Daily check-ins for friend groups, personal goals, and the moments you do not want to quietly drop.</Text>
      </View>
      <AppCard style={styles.form}>
        <AppInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          value={email}
        />
        <AppInput
          autoComplete="password"
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          value={password}
        />
        <AppButton disabled={loading} onPress={signIn} title={loading ? 'Working...' : 'Sign in'} />
        <AppButton disabled={loading} onPress={signUp} title="Create account" variant="secondary" />
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 24,
  },
  form: {
    gap: 12,
    padding: 18,
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
