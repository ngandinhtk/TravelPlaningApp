import { Alert, Platform, ToastAndroid } from 'react-native';

// Cross-platform toast helper: uses ToastAndroid on Android, Alert fallback elsewhere.
export function showToast(message) {
  try {
    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravity(message, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    } else {
      // For iOS and Web fall back to Alert (simple) — can be replaced with a nicer UI later
      Alert.alert('', message);
    }
  } catch (err) {
    // As a last resort, console.log
    console.log('Toast:', message);
  }
}
