import { Stack } from 'expo-router';
import { AppProviders } from '../context/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/forget" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="home/home" />
        <Stack.Screen name="trip/create" />
        <Stack.Screen name="trip/detail" />
        <Stack.Screen name="trip/edit" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </AppProviders>
  );
}