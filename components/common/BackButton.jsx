// src/components/BackButton.tsx   (or components/ui/BackButton.tsx)

import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native'; // optional: beautiful icon
import { Pressable } from 'react-native';

// Option A: With nice icon + "Back" text (most common)
export default function BackButton() {
  const handlePress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/'); // or router.replace('/') if you don't want history
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center -ml-3 px-3 py-2 active:opacity-60"
      hitSlop={20}
    >
      <ChevronLeft style={{ marginBottom: 40 }} size={26} color="#007AFF" strokeWidth={2.5} /> 
    </Pressable>
  );
}