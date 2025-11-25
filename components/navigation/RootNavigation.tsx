// src/navigation/RootNavigator.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Redirect } from 'expo-router'; // Import Redirect from expo-router
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { auth } from '../../services/firebase';

import LoginScreen from '../../screens/auth/LoginScreen';
import RegisterScreen from '../../screens/auth/RegisterScreen';
import OnboardingScreen from '../../screens/home/OnboardingScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Firebase connection successful. Auth state received.');
      setUser(currentUser);
      console.log('Current User:', currentUser ? currentUser.uid : 'No user is signed in.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Check if onboarding has been completed
    const checkOnboarding = async () => {
      const value = await AsyncStorage.getItem('@onboardingCompleted');
      if (value !== null) {
        setOnboardingCompleted(true);
      }
      setLoading(false); // Also set loading to false here
    };
    checkOnboarding();
  }, []);

  const handleLogin = async (email:string, password:string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // After successful registration, the onAuthStateChanged listener
      // will automatically update the user state and navigate to the app.
    } catch (error) {
      console.error("Registration Error:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('@onboardingCompleted', 'true');
    setOnboardingCompleted(true);
  };

  if (loading) {
    return (
      <></>  // hoặc thêm màn hình loading đẹp ở đây
    );
  }

  return (
    // The NavigationContainer is now handled by the root _layout.tsx in expo-router.
    // We just return the Stack.Navigator here.
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!onboardingCompleted ? (
        <Stack.Screen name="Onboarding">
          {(props) => <OnboardingScreen {...props} onComplete={handleOnboardingComplete} />}
        </Stack.Screen>
      ) : user ? (
        // If user is logged in, redirect to the expo-router (tabs) route
        <Stack.Screen name="AppTabs" options={{ headerShown: false }}>
          {/* Redirect to the (tabs) route which is handled by expo-router */}
          {() => <Redirect href="/(tabs)" />}
        </Stack.Screen>
      ) : (
        <>
          {/* The onSignUp prop navigates to the Register screen */}
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={handleLogin} onSignUp={() => props.navigation.navigate('Register')} onForgotPassword={() => props.navigation.navigate('ForgetPassword')} onMockLogin={() => props.navigation.navigate('MockLogin')} />}
          </Stack.Screen>
          {/* The onRegister prop now navigates back to Login after completion */}
          <Stack.Screen name="Register">
            {(props) => <RegisterScreen {...props} onRegister={handleRegister} onBack={() => props.navigation.goBack()} />}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
}