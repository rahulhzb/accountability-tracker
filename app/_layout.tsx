import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/src/features/auth/auth-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootStack() {
  const { loading, profile, session } = useAuth();
  const segments = useSegments();
  const isInAuthGroup = segments[0] === '(auth)';
  const isOnboarding = segments[0] === 'onboarding';

  if (loading) {
    return null;
  }

  if (!session && !isInAuthGroup) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (session && isInAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  if (session && !profile && !isOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (session && profile && isOnboarding) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="challenges/[challengeId]" options={{ title: 'Challenge' }} />
      <Stack.Screen name="challenges/new" options={{ title: 'New Challenge' }} />
      <Stack.Screen name="check-ins/[goalId]" options={{ title: 'Check In' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootStack />
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
