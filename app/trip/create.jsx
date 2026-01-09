import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import RNPickerSelect from 'react-native-picker-select';
import CustomModal from '../../components/common/Modal';
import { useUser } from '../../context/UserContext';
import { getAllCountries } from '../../services/countryService';
import { addTrip } from '../../services/tripService';

const CreateTripScreen = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState([]);
  const [selectedCountryId, setSelectedCountryId] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [travelers, setTravelers] = useState('2');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [tripId, setTripId] = useState(Date.now());
  const [interests, setInterests] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const { user } = useUser();
  const [error, setError] = useState(null);
  const interestOptions = [
    { emoji: '🏖️', name: 'Beach' },
    { emoji: '🏔️', name: 'Mountain' },
    { emoji: '🍜', name: 'Food' },
    { emoji: '🎨', name: 'Culture' },
    { emoji: '🏛️', name: 'History' },
    { emoji: '🎢', name: 'Adventure' },
  ];
  // console.log(Platform.OS === 'web' ? 'Running on Web' : 'Running on Native');

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countryData = await getAllCountries();
        // Format for RNPickerSelect
        const pickerItems = countryData.map(c => ({ label: `${c.name}`, value: c.id }));
        setCountries(pickerItems);
      } catch (e) {
        console.error("Failed to fetch countries:", e);
      }
    };
    fetchCountries();
  }, []);
  
  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleCreateTrip = async () => {
    if (!selectedCountryId || !startDate.toDateString() || !endDate.toDateString()) {
      setError('Vui lòng điền đầy đủ các trường thông tin cần thiết.');
      return;
    }
    
    try {
      const start = startDate;
      const end = endDate;
      const timeDiff = end.getTime() - start.getTime();
      const calculatedDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

      const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      if (end < start) {
        setError('Ngày kết thúc không thể trước ngày bắt đầu.');
        return;
      }
      const startStr = formatDate(startDate);
      const endStr = formatDate(endDate);
      
      const selectedCountry = countries.find(c => c.value === selectedCountryId);

      // setTripId(tripId + 1);
      await addTrip({
        userId: user.uid,
        destination: selectedCountry ? selectedCountry.label : '',
        dates: `${startStr} - ${endStr}`,
        countryCode: selectedCountryId,
        status: updateTripStatus({ startDate, endDate, status: 'planning' }),
        travelers: parseInt(travelers),
        budget: parseFloat(budget),
        days: calculatedDays,
        interests,
        tripId,
        notes: notes || '',
      });
      setSuccessMessage('Trip created successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
        router.push('/');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating trip:', error);
      setError('Failed to create trip.');
    }

  };

  onBack = () => {
    router.push('/');
  }

if (Platform.OS === 'web') {
  require('react-datepicker/dist/react-datepicker.css');
}

let DatePicker; // Will be assigned conditionally
if (Platform.OS === 'web') {
  const ReactDatePicker = require('react-datepicker').default;
  DatePicker = ReactDatePicker;
}


const updateTripStatus = (trip) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Handle both Date objects and Firebase Timestamps
  const endDate = trip.endDate.toDate ? trip.endDate.toDate() : new Date(trip.endDate);
  endDate.setHours(23, 59, 59, 999);

  const startDate = trip.startDate.toDate ? trip.startDate.toDate() : new Date(trip.startDate);

  if (trip.status === "archived") return "archived";
  if (endDate < today) return "past";
  if (startDate > today) return "upcoming";
  return "upcoming";
};


  const handleStartDateChange = (date) => {
    setStartDate(date);
    setShowStartDatePicker(false);
  };
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
  const handleEndDateChange = (date) => {
    setEndDate(date);
    setShowEndDatePicker(false);
  };

  const renderNativePicker = () => (
    <>
      {showStartDatePicker && (
        <DateTimePickerModal
          isVisible={showStartDatePicker}
          mode="date"
          onConfirm={handleStartDateChange}
          onCancel={() => setShowStartDatePicker(false)}
          date={startDate}
        />
      )}
      {showEndDatePicker && (
        <DateTimePickerModal
          isVisible={showEndDatePicker}
          mode="date"
          onConfirm={handleEndDateChange}
          onCancel={() => setShowEndDatePicker(false)}
          date={endDate}
          minimumDate={startDate}
        />
      )}
    </>
  );

  const renderWebPicker = () => (
    <>
      {showStartDatePicker && (
        <div style={styles.webPickerOverlay} onClick={() => setShowStartDatePicker(false)}>
          <div style={styles.webPickerContainer} onClick={(e) => e.stopPropagation()}>
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              dateFormat="MM/dd/yyyy"
              inline
            />
            <button 
              onClick={() => setShowStartDatePicker(false)}
              style={styles.webPickerButton}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showEndDatePicker && (
        <div style={styles.webPickerOverlay} onClick={() => setShowEndDatePicker(false)}>
          <div style={styles.webPickerContainer} onClick={(e) => e.stopPropagation()}>
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              dateFormat="MM/dd/yyyy"
              minDate={startDate}
              inline
            />
            <button 
              onClick={() => setShowEndDatePicker(false)}
              style={styles.webPickerButton}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );

  
  return (
    <View style={styles.createTripContainer}>
      <CustomModal
        visible={!!error}
        title="Thông Báo Lỗi"
        onClose={() => setError(null)}
        onConfirm={() => setError(null)}
      >
        <Text>{error}</Text>
      </CustomModal>

      <CustomModal
        visible={!!successMessage}
        title="Thành Công"
        onClose={() => setSuccessMessage(null)}
        onConfirm={() => setSuccessMessage(null)}
      >
        <Text>{successMessage}</Text>
      </CustomModal>

      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.createTripHeader}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButtonTextWhite}>&larr; Back</Text>
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
              <View style={styles.input}>
                <RNPickerSelect style={pickerSelectStyles}
                  onValueChange={(value) => setSelectedCountryId(value)}
                  items={countries}
                  
                  placeholder={{ label: 'Select a country...', value: null }}
                  useNativeAndroidPickerStyle={false}
                  value={selectedCountryId}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Start Date</Text>
                <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.input}>
                  <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
                {Platform.OS === 'web' ? renderWebPicker() : renderNativePicker()}
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>End Date</Text>
                <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.input}>
                  <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
                {Platform.OS === 'web' ? renderWebPicker() : renderNativePicker()}
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

             <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ghi chú</Text>
              <TextInput
                style={styles.input}
                placeholder="ví dụ: mang theo áo ấm"
                value={notes}
                onChangeText={setNotes}
                keyboardType="default"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.nextButton, { flex: 1, marginLeft: 10 }]}
                onPress={() => setStep(1)}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}>
                  <Text style={styles.secondaryButtonText}>Quay lại</Text>
                  </LinearGradient>
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
               <TouchableOpacity 
                style={[styles.nextButton, { flex: 1, marginLeft: 10 }]}
                onPress={() => setStep(1)}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}>
                  <Text style={styles.secondaryButtonText}>Quay lại</Text>
                  </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.nextButton, { flex: 1, marginLeft: 10 }]}
                onPress={handleCreateTrip}>
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
    paddingTop: 50,
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
    marginTop: 10,
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
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
  },
  nextButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: -1
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
    color: '#FFFFFF',
    fontSize: 18,
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
  // Web Date Picker Styles
  webPickerOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  webPickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    maxWidth: 400,
  },
  webPickerButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#667eea',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 2, // Adjust vertical padding to align text
    color: 'transparent',

  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 2, // Adjust vertical padding to align text
    color: 'black',
  },
  placeholder: {
    color: '#999',
  },
});


export default CreateTripScreen;