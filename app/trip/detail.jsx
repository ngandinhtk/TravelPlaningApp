import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Loading from '../../components/common/Loading';
import CustomModal from '../../components/common/Modal';
import { useTrip } from '../../context/TripContext';
import { deleteTrip } from '../../services/tripService';

const TripDetailScreen = () => {
  const { trip } = useTrip(); // Lấy toàn bộ đối tượng trip từ Context
  const router = useRouter();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Nếu trip chưa được tải xong (do context đang fetch), hiển thị loading
  // console.log('Trip in Detail Screen:', trip);
  if (!trip) {
    return (
      <Loading />
    );
  }

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push('/trip/edit'); // Không cần truyền params nữa
  };

  const handleDelete = () => {
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    setIsDeleteModalVisible(false);
    try {
      await deleteTrip(trip.id);
      router.push('/home/home'); // Quay về trang chủ và làm mới
    } catch (error) {
      console.error('Lỗi khi xóa chuyến đi:', error);
      setDeleteError('Không thể xóa chuyến đi. Vui lòng thử lại.');
    }
  };

  return (
    <View style={styles.itineraryContainer}>
      <CustomModal
        visible={isDeleteModalVisible}
        title="Xác nhận xóa"
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={confirmDelete}
      >
        <Text>Bạn có chắc chắn muốn xóa chuyến đi này không? Hành động này không thể hoàn tác.</Text>
      </CustomModal>

      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.itineraryHeader}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backButtonTextWhite}>&larr; Back</Text>
        </TouchableOpacity>
        <Text style={styles.itineraryTitle}>{trip.destination}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit}>
            <Text style={styles.editButton}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteButton}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Trip Summary */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.summarySection}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Dates</Text>
            <Text style={styles.summaryValue}>{trip.dates}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Travelers</Text>
            <Text style={styles.summaryValue}>👥 {trip.travelers}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Budget</Text>
            <Text style={styles.summaryValue}>💰 ${trip.budget}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>📅 {trip.days} days</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Status</Text>
            <Text style={styles.summaryValue}>{trip.status}</Text>
          </View>
            <View style={styles}>
            <Text style={styles.summaryLabel}>Note</Text>
            <Text style={styles.summaryValue}>📝 {trip.notes}</Text>
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Trip Details</Text>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Destination</Text>
            <Text style={styles.detailValue}>{trip.destination}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// Vui lòng thêm styles từ tệp gốc của bạn vào đây
const styles = StyleSheet.create({
  itineraryContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  center: {
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  itineraryHeader: {
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
  itineraryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editButton: {
    fontSize: 20,
  },
  deleteButton: {
    fontSize: 20,
    marginLeft: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  errorButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: '#667eea',
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  summarySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
});

export default TripDetailScreen;