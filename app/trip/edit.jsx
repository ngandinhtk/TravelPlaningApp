import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import CustomModal from '../../components/common/Modal';
import { updateTrip } from '../../services/tripService';

const EditTripScreen = () => {
  const router = useRouter();
  const { trip: tripStr } = useLocalSearchParams();

  const [trip, setTrip] = useState(null);
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [travelers, setTravelers] = useState('');
  const [budget, setBudget] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (tripStr) {
      const parsedTrip = JSON.parse(tripStr);
      setTrip(parsedTrip);
      setDestination(parsedTrip.destination);
      setTravelers(String(parsedTrip.travelers));
      setBudget(String(parsedTrip.budget));

      // Chuyển đổi chuỗi ngày tháng 'DD/MM/YYYY' thành đối tượng Date
      const dateParts = parsedTrip.dates.split(' - ');
      const [startDay, startMonth, startYear] = dateParts[0].split('/');
      const [endDay, endMonth, endYear] = dateParts[1].split('/');
      setStartDate(new Date(`${startYear}-${startMonth}-${startDay}`));
      setEndDate(new Date(`${endYear}-${endMonth}-${endDay}`));
    }
  }, [tripStr]);

  const handleUpdateTrip = async () => {
    if (!destination || !startDate || !endDate) {
      setError('Vui lòng điền đầy đủ các trường thông tin cần thiết.');
      return;
    }

    const timeDiff = endDate.getTime() - startDate.getTime();
    const calculatedDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const updatedData = {
      destination,
      dates: `${formatDate(startDate)} - ${formatDate(endDate)}`,
      travelers: parseInt(travelers, 10),
      budget: parseFloat(budget),
      days: calculatedDays,
    };

    try {
      await updateTrip(trip.id, updatedData);
      setSuccessMessage('Cập nhật chuyến đi thành công!');
      setTimeout(() => {
        setSuccessMessage(null);
        router.push('/home/home'); // Quay về trang chủ và làm mới
      }, 2000);
    } catch (e) {
      console.error('Lỗi khi cập nhật chuyến đi:', e);
      setError('Không thể cập nhật chuyến đi. Vui lòng thử lại.');
    }
  };

  const handleStartDateChange = (date) => {
    setShowStartDatePicker(false);
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setShowEndDatePicker(false);
    setEndDate(date);
  };

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text>Đang tải thông tin chuyến đi...</Text>
      </View>
    );
  }

  return (
    <View style={styles.createTripContainer}>
      <CustomModal visible={!!error} title="Lỗi" onClose={() => setError(null)} onConfirm={() => setError(null)}>
        <Text>{error}</Text>
      </CustomModal>
      <CustomModal visible={!!successMessage} title="Thành công" onClose={() => setSuccessMessage(null)} onConfirm={() => setSuccessMessage(null)}>
        <Text>{successMessage}</Text>
      </CustomModal>

      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.createTripHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButtonTextWhite}>&larr; Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.createTripTitle}>Chỉnh sửa chuyến đi</Text>
        <View style={{ width: 80 }} />
      </LinearGradient>

      <ScrollView style={styles.createTripForm} showsVerticalScrollIndicator={false}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Điểm đến</Text>
          <TextInput style={styles.input} value={destination} onChangeText={setDestination} />
        </View>

        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.inputLabel}>Ngày bắt đầu</Text>
            <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.input}>
              <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Ngày kết thúc</Text>
            <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.input}>
              <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Số lượng người đi</Text>
          <TextInput style={styles.input} value={travelers} onChangeText={setTravelers} keyboardType="numeric" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Ngân sách ($)</Text>
          <TextInput style={styles.input} value={budget} onChangeText={setBudget} keyboardType="numeric" />
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleUpdateTrip}>
          <LinearGradient colors={['#667eea', '#764ba2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
            <Text style={styles.nextButtonText}>Lưu thay đổi</Text>
          </LinearGradient>
        </TouchableOpacity>

        <DateTimePickerModal isVisible={showStartDatePicker} mode="date" onConfirm={handleStartDateChange} onCancel={() => setShowStartDatePicker(false)} date={startDate} />
        <DateTimePickerModal isVisible={showEndDatePicker} mode="date" onConfirm={handleEndDateChange} onCancel={() => setShowEndDatePicker(false)} date={endDate} minimumDate={startDate} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  createTripForm: {
    flex: 1,
    padding: 20,
    marginTop: 10,
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
});

export default EditTripScreen;