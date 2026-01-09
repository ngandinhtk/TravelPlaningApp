import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/common/BackButton';
import CustomModal from '../../components/common/Modal';
import { useTrip } from '../../context/TripContext';
import { useUser } from '../../context/UserContext';
import { getAllTemplates } from '../../services/templateService';
import { addTrip, applyTemplateToTrip, getTrips, mapTemplateToTrip } from '../../services/tripService';

import LoadingScreen from '../../components/common/Loading';
import { showToast } from '../../lib/showToast';

const TemplateListScreen = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importingStatus, setImportingStatus] = useState({});
  const [showTripPicker, setShowTripPicker] = useState(false);
  const [userTrips, setUserTrips] = useState([]);
  const [loadingUserTrips, setLoadingUserTrips] = useState(false);
  const [selectedTemplateForExisting, setSelectedTemplateForExisting] = useState(null);
  const [applyingToExisting, setApplyingToExisting] = useState(false);
  const { user } = useUser();
  const { setSelectedTripId } = useTrip();
  const router = useRouter();

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const fetchedTemplates = await getAllTemplates();
        setTemplates(fetchedTemplates);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
        alert('Đã có lỗi xảy ra khi tải lịch trình mẫu.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
    
  }, []);

  const handleSelectTemplate = (template) => {
    // TODO: Navigate to a new screen to view/customize the template details
    // For now, we just log it and go back.
    // console.log('Selected Template:', template.id);
    alert(`Bạn đã chọn mẫu "${template.name}".\nTính năng tùy chỉnh sẽ được phát triển ở bước tiếp theo.`);
    // router.push(`/trip/${template.id}`);
  };

  const handleImportTemplate = async (template) => {
    if (!user) {
      Alert.alert('Yêu cầu đăng nhập', 'Bạn cần đăng nhập để lưu lịch trình này.');
      return;
    }

    Alert.alert(
      'Nhập lịch trình mới',
      `Bạn có muốn nhập mẫu "${template.name}" thành một chuyến đi mới không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Nhập',
          onPress: async () => {
            setImportingStatus(prev => ({ ...prev, [template.id]: 'new' }));
            try {
              // Use mapping helper to build trip payload from template
              const tripData = mapTemplateToTrip(template, user.uid);
              const newTripId = await addTrip(tripData);
              setSelectedTripId(newTripId);
                showToast('Đã nhập mẫu thành chuyến đi mới thành công!');
              router.push('/trip/detail');
            } catch (error) {
              console.error('Failed to import template:', error);
              Alert.alert('Lỗi', 'Không thể import template. Vui lòng thử lại sau.');
            } finally {
              setImportingStatus(prev => ({ ...prev, [template.id]: null }));
            }
          },
        },
      ]
    );
  };

  const handleOpenTripPicker = async (template) => {
    if (!user) {
      Alert.alert('Yêu cầu đăng nhập', 'Bạn cần đăng nhập để áp dụng mẫu này.');
      return;
    }
    setSelectedTemplateForExisting(template);
    setLoadingUserTrips(true);
    setShowTripPicker(true);
    try {
      const trips = await getTrips(user.uid);
      setUserTrips(trips);
    } catch (err) {
      console.error('Failed to fetch user trips:', err);
      Alert.alert('Lỗi', 'Không thể tải danh sách chuyến đi của bạn.');
      setShowTripPicker(false); // Close picker on error
    } finally {
      setLoadingUserTrips(false);
    }
  };

  const handleApplyToExistingTrip = async (trip) => {
    if (!selectedTemplateForExisting || applyingToExisting) return;

    setApplyingToExisting(true);
    try {
      await applyTemplateToTrip(user.uid, trip.id, selectedTemplateForExisting.id);
      setSelectedTripId(trip.id);
      showToast('Đã áp dụng mẫu vào chuyến đi!');
      setShowTripPicker(false);
      router.push('/trip/detail');
    } catch (err) {
      console.error('Failed to apply template to existing trip:', err);
      Alert.alert('Lỗi', 'Không thể áp dụng mẫu vào chuyến đi này.');
    } finally {
      setApplyingToExisting(false);
    }
  };

  const renderTemplateItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleSelectTemplate(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardBudget}>
          ~{(item.budgetMin / 1000000).toFixed(1)} - {(item.budgetMax / 1000000).toFixed(1)}tr
        </Text>
      </View>
      <Text style={styles.cardHighlights}>  
        <Text style={{ fontWeight: 'bold' }}>Nổi bật: </Text>
        {item.highlights.join(' • ')}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardTripType}>{item.tripType}</Text>
        <TouchableOpacity onPress={() => handleImportTemplate(item)} style={{ marginLeft: 12 }} disabled={!!importingStatus[item.id]}>
          <Text style={{ color: '#667eea', fontWeight: '600' }}>
            {importingStatus[item.id] === 'new' ? 'Đang nhập...' : 'Nhập mới'}
          </Text>
        </TouchableOpacity>
          <TouchableOpacity onPress={() => handleOpenTripPicker(item)} style={{ marginLeft: 12 }} disabled={!!importingStatus[item.id]}>
            <Text style={{ color: '#27ae60', fontWeight: '600' }}>Áp dụng vào...</Text>
          </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>😢</Text>
      <Text style={styles.emptyText}>Không tìm thấy lịch trình mẫu nào phù hợp.</Text>
      <Text style={styles.emptySubText}>Vui lòng thử lại với các tiêu chí khác.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Lịch Trình Gợi Ý</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        // <ActivityIndicator size="large" color="#667eea" style={{ marginTop: 50 }} />
        <LoadingScreen />
      ) : (
        <FlatList
          data={templates}
          renderItem={renderTemplateItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={ListEmptyComponent}
        />
      )}

      <CustomModal
        visible={showTripPicker}
        title="Chọn chuyến đi để import"
        onClose={() => setShowTripPicker(false)}
      >
        {loadingUserTrips ? (
          <Text>Loading trips...</Text>
        ) : (
          <>
            {userTrips.length === 0 ? (
              <Text>Bạn chưa có chuyến đi nào. Hãy tạo chuyến mới trước khi import.</Text>
            ) : (
              userTrips.map((t) => (
                <TouchableOpacity key={t.id} onPress={() => handleApplyToExistingTrip(t)} style={styles.tripPickerItem} disabled={applyingToExisting}>
                  <Text style={{ fontSize: 16, fontWeight: '600' }}>{t.destination} {t.dates ? `- ${t.dates}` : ''}</Text>
                </TouchableOpacity>
              ))
            )}
            {applyingToExisting && <LoadingScreen message="Đang áp dụng..."/>}
          </>
        )}
      </CustomModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#fff' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  listContainer: { padding: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1 },
  cardBudget: { fontSize: 14, color: '#27ae60', fontWeight: '600' },
  cardHighlights: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end' },
  cardTripType: { fontSize: 12, color: '#667eea', fontWeight: 'bold', textTransform: 'uppercase', backgroundColor: '#eef0ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 24, color: '#666', marginBottom: 10, textAlign: 'center' },
  emptySubText: { fontSize: 16, color: '#999' }, 
  tripPickerItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
});

export default TemplateListScreen;