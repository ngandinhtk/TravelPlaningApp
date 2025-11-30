import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useUser } from '../context/UserContext';

export default function Index() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    // Chờ cho đến khi trạng thái xác thực của người dùng được xác định
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    // Nếu người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
    return <Redirect href="/auth/login" />;
  }

  // Nếu người dùng là admin, chuyển hướng đến trang dashboard
  if (user.role === 'admin') {
    return <Redirect href="/(admin)/dashboard" />;
  }

  // Nếu là người dùng thường, chuyển hướng đến trang chủ
  return <Redirect href="/home/home" />;
}