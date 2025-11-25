import { signOut } from "firebase/auth";
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import LoginScreen from './screens/auth/LoginScreen';
import HomeScreen from './screens/home/HomeScreen';
import { auth } from './services/firebase';

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Xử lý thay đổi trạng thái người dùng
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) {
      setInitializing(false);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, onAuthStateChanged);
    return unsubscribe; // Hủy đăng ký khi component unmount
  }, []);

  const handleLogin = async (email, password) => {
    try {
    } catch (e) {
      console.error(e.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    // setUser(null) will be handled by the onAuthStateChanged listener
  };

  if (initializing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} onSignUp={() => { /* Điều hướng đến màn hình đăng ký */ }} />;
  }

  return <HomeScreen user={user} onLogout={handleLogout} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default App;