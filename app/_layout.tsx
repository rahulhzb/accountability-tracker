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
  const { loading, session } = useAuth();
  const segments = useSegments();
  const isInAuthGroup = segments[0] === '(auth)';

  if (loading) {
    return null;
  }

  if (!session && !isInAuthGroup) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (session && isInAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="challenges/[challengeId]" options={{ title: 'Challenge' }} />
      <Stack.Screen name="challenges/new" options={{ title: 'New Challenge' }} />
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
