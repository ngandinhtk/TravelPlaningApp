import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const OnboardingScreen = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const slides = [
    {
      icon: '🗺️',
      title: 'AI-Powered Planning',
      description: 'Let our AI create perfect itineraries tailored to your preferences',
      gradient: ['#667eea', '#764ba2']
    },
    {
      icon: '💰',
      title: 'Smart Budgeting',
      description: 'Track expenses and stay within budget with intelligent recommendations',
      gradient: ['#f093fb', '#f5576c']
    },
    {
      icon: '🎯',
      title: 'Discover & Book',
      description: 'Find hidden gems and book everything in one place',
      gradient: ['#4facfe', '#00f2fe']
    }
  ];

  const currentSlide = slides[step];

  return (
    <LinearGradient
      colors={currentSlide.gradient}
      style={styles.onboardingContainer}
    >
      <View style={styles.onboardingContent}>
        <Text style={styles.onboardingIcon}>{currentSlide.icon}</Text>
        <Text style={styles.onboardingTitle}>{currentSlide.title}</Text>
        <Text style={styles.onboardingDescription}>{currentSlide.description}</Text>
      </View>

      <View style={styles.onboardingDots}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === step && styles.dotActive
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        {step > 0 && (
          <TouchableOpacity
            style={styles.onboardingButton}
            onPress={() => setStep(step - 1)}>
            <Text style={styles.onboardingButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.onboardingButton}
          onPress={() => {
            if (step < slides.length - 1) {
              setStep(step + 1);
            } else {
              onComplete();
            }
          }}>
          <Text style={styles.onboardingButtonText}>
            {step < slides.length - 1 ? 'Next' : 'Get Started'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
    onboardingContainer: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 30,
      },
      onboardingContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      onboardingIcon: {
        fontSize: 100,
        marginBottom: 40,
      },
      onboardingTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 15,
        textAlign: 'center',
      },
      onboardingDescription: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
        opacity: 0.9,
      },
      onboardingButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
      },
      onboardingButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.47)',
        // LinearGradient: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
        marginHorizontal: 10,
      },
      buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      },
      onboardingDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
      },
});

export default OnboardingScreen;