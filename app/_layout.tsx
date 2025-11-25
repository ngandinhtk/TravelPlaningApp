import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import RootNavigator from '../components/navigation/RootNavigation';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* RootNavigator will handle the entire app's navigation, including auth and main content */}
      <RootNavigator />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
