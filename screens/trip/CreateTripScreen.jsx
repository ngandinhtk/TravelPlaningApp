import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CreateTripScreen = ({ onBack, onTripCreated }) => {
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState('2');
  const [budget, setBudget] = useState('');
  const [interests, setInterests] = useState([]);

  const interestOptions = [
    { emoji: '🏖️', name: 'Beach' },
    { emoji: '🏔️', name: 'Mountain' },
    { emoji: '🍜', name: 'Food' },
    { emoji: '🎨', name: 'Culture' },
    { emoji: '🏛️', name: 'History' },
    { emoji: '🎢', name: 'Adventure' },
  ];

  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleCreate = () => {
    const trip = {
      id: Date.now().toString(),
      destination,
      dates: `${startDate} - ${endDate}`,
      travelers: `${travelers} people`,
      budget,
      days: 5,
      status: '📝 Planning',
      interests,
    };
    onTripCreated(trip);
  };

  return (
    <View style={styles.createTripContainer}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.createTripHeader}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButtonTextWhite}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.createTripTitle}>Create Trip</Text>
        <Text style={styles.stepIndicator}>Step {step}/3</Text>
      </LinearGradient>

      <ScrollView style={styles.createTripForm} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Where are you going? ✈️</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Destination</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Paris, Tokyo, New York"
                value={destination}
                onChangeText={setDestination}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Start Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>End Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={() => setStep(2)}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}>
                <Text style={styles.nextButtonText}>Next</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Ai đi cùng & ngân sách? 💰</Text>
            <Text style={styles.stepSubtitle}>Hãy cho chúng tôi biết bạn đồng hành với ai.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số lượng người đi</Text>
              <TextInput
                style={styles.input}
                placeholder="ví dụ: 2"
                value={travelers}
                onChangeText={setTravelers}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ngân sách mỗi người (USD)</Text>
              <TextInput
                style={styles.input}
                placeholder="ví dụ: 1000"
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(1)}>
                <Text style={styles.secondaryButtonText}>Quay lại</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.nextButton, { flex: 1, marginLeft: 10 }]}
                onPress={() => setStep(3)}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}>
                  <Text style={styles.nextButtonText}>Tiếp theo</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Your Interests 💫</Text>
            <Text style={styles.stepSubtitle}>Select what you love (optional)</Text>

            <View style={styles.interestsGrid}>
              {interestOptions.map((interest, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.interestChip,
                    interests.includes(interest.name) && styles.interestChipActive,
                    ]}
                  onPress={() => toggleInterest(interest.name)}>
                  <Text style={styles.interestChipEmoji}>{interest.emoji}</Text>
                  <Text
                    style={[
                      styles.interestChipText,
                      interests.includes(interest.name) && styles.interestChipTextActive,
                    ]}>
                    {interest.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(2)}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.nextButton, { flex: 1, marginLeft: 10 }]}
                onPress={handleCreate}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}>
                  <Text style={styles.nextButtonText}>Create Trip ✨</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={{ height: 50 }} />
      </ScrollView>
    </View >
  );
};

// Vui lòng thêm styles từ tệp gốc của bạn vào đây
const styles = StyleSheet.create({
  createTripContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  createTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  backButtonTextWhite: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  createTripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepIndicator: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  createTripForm: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  inputRow: {
    flexDirection: 'row',
  },
  nextButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  interestChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  interestChipEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  interestChipText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  interestChipTextActive: {
    color: '#FFFFFF',
  },
});

export default CreateTripScreen;