import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

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
    <View style={styles.container}>
      <Text style={styles.title}>Accountability Tracker</Text>
      <Text style={styles.subtitle}>Check in daily. Keep promises visible.</Text>
      <TextInput
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
        value={email}
      />
      <TextInput
        autoComplete="password"
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
      />
      <Button disabled={loading} onPress={signIn} title={loading ? 'Working...' : 'Sign in'} />
      <Button disabled={loading} onPress={signUp} title="Create account" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  input: {
    borderColor: '#C8D0D9',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  subtitle: {
    color: '#546170',
    fontSize: 16,
    marginBottom: 12,
  },
  title: {
    color: '#111827',
    fontSize: 30,
    fontWeight: '700',
  },
});
