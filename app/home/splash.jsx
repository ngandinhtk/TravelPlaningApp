import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SplashScreen = () => (
  <LinearGradient
    colors={['#667eea', '#764ba2']}
    style={styles.splashContainer}
  >
    <View style={styles.logoContainer}>
      <Text style={styles.logoIcon}>✈️</Text>
      <Text style={styles.logoText}>TravelMind AI</Text>
      <Text style={styles.logoSubtext}>Your AI Travel Companion</Text>
    </View>
    <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 30 }} />
  </LinearGradient>
);

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  logoSubtext: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
});

export default SplashScreen;