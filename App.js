import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import LoginScreen from "./app/auth/login";
import HomeScreen from "./app/home/home";
import { auth } from "./services/firebase";

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Lắng nghe sự thay đổi trạng thái xác thực của người dùng
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return unsubscribe; // Hủy đăng ký khi component unmount
  }, []);

  const handleLogin = async (email, password) => {
    try {
      // TODO: Implement login logic using signInWithEmailAndPassword
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
    return (
      <LoginScreen
        onLogin={handleLogin}
        onSignUp={() => {
          /* Điều hướng đến màn hình đăng ký */
        }}
      />
    );
  }

  return <HomeScreen user={user} onLogout={handleLogout} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});

export default App;
