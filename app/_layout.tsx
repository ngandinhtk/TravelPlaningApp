import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth } from '@/services/firebase';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe; // Cleanup on unmount
  }, []);

  useEffect(() => {
    if (loading) return; // Don't redirect until authentication status is known

    const inAuthGroup = segments[0] === 'auth';

    if (user && inAuthGroup) {
      // If the user is signed in and somehow on a login/register screen, redirect them away.
      router.replace('/');
    } else if (!user && !inAuthGroup) {
      // If the user is not signed in and not in the auth group, send them to the login screen.
      router.replace('/auth/login');
    }
  }, [user, segments, loading, router]);

  if (loading) {
    return null; // Or you can return a loading spinner component here
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* This Stack component is now the root navigator, managed by Expo Router */}
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
