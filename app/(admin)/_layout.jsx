import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useUser } from '../../context/UserContext';

export default function AdminLayout() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Nếu không phải admin, chuyển hướng về trang chủ
  if (!user || user.role !== 'admin') {
    return <Redirect href="/home/home" />;
  }

  // Nếu là admin, hiển thị các màn hình trong stack
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="users" />
      <Stack.Screen name="trips" />
    </Stack>
  );
}