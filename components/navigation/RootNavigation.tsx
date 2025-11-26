// src/navigation/RootNavigator.tsx
import HomeScreen from '@/screens/home/HomeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import LoginScreen from '../../screens/auth/LoginScreen';
import RegisterScreen from '../../screens/auth/RegisterScreen';
import OnboardingScreen from '../../screens/home/OnboardingScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import CreateTripScreen from '../../screens/trip/CreateTripScreen';
import { auth } from '../../services/firebase';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

   // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
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
        <>
          <Stack.Screen name="Home" options={{ headerShown: false }}>
            {(props) => (
              <HomeScreen
                {...props}
                user={user}
                onProfile={() => props.navigation.navigate('Profile')}
                onCreateTrip={() => props.navigation.navigate('CreateTrip', { user })}
                onViewTrip={(trip: any) => props.navigation.navigate('TripDetail', { tripId: trip.id })}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Profile">
            {(props) => <ProfileScreen {...props} user={user} onBack={() => props.navigation.goBack()} onLogout={handleLogout} />}
          </Stack.Screen>
             <Stack.Screen name="CreateTrip">
              {(props) => <CreateTripScreen {...props} onTripCreated={[]} onBack={() => props.navigation.goBack()} />}
            </Stack.Screen>
        </>
      ) : (
        <>
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={handleLogin} onSignUp={() => props.navigation.navigate('Register')} onForgotPassword={() => props.navigation.navigate('ForgetPassword')} />}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {(props) => <RegisterScreen {...props} onRegister={handleRegister} onBack={() => props.navigation.goBack()} />}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
}