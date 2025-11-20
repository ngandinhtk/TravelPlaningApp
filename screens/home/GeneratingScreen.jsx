import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { generateMockItinerary } from '../../lib/data';
const GeneratingScreen = ({ trip, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Analyzing your preferences...');

  useEffect(() => {
    const statuses = [
      'Analyzing your preferences...',
      'Finding the best attractions...',
      'Optimizing your route...',
      'Selecting restaurants...',
      'Finalizing your itinerary...'
    ];

    let currentStatus = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete(generateMockItinerary(trip));
          }, 500);
          return 100;
        }
        return prev + 2;
      });

      if (progress % 20 === 0 && currentStatus < statuses.length - 1) {
        currentStatus++;
        setStatus(statuses[currentStatus]);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [progress]);

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.generatingContainer}
    >
      <Text style={styles.generatingIcon}>✨</Text>
      <Text style={styles.generatingTitle}>Creating Your Perfect Trip</Text>
      <Text style={styles.generatingStatus}>{status}</Text>
      
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
      
      <Text style={styles.progressText}>{progress}%</Text>

      <View style={styles.generatingFeatures}>
        <Text style={styles.featureText}>🎯 Personalized to your interests</Text>
        <Text style={styles.featureText}>💰 Optimized for your budget</Text>
        <Text style={styles.featureText}>🗺️ Smart route planning</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
    generatingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
      },
      generatingIcon: {
        fontSize: 80,
        marginBottom: 30,
      },
      generatingTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 15,
        textAlign: 'center',
      },
      generatingStatus: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.9,
        marginBottom: 30,
      },
      progressBarContainer: {
        width: '100%',
        height: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 5,
        marginBottom: 10,
      },
      progressBar: {
        height: '100%',
        borderRadius: 5,
        overflow: 'hidden',
      },
      progressFill: {
        height: '100%',
        backgroundColor: '#FFFFFF',
      },
      progressText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
        marginBottom: 40,
      },
});

export default GeneratingScreen;