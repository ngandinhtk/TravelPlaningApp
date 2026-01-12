import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import BackButton from '../../components/common/BackButton';
import { addPlace, getAllPlaces, getPlacesByProvince, getProvincesList, searchPlacesViaGoogle, seedPlaces } from '../../services/placeService';

const DiscoverPlacesScreen = () => {
  const router = useRouter();
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('All');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [isShowingGoogleResults, setIsShowingGoogleResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProvinces = async () => {
      const list = await getProvincesList();
      setProvinces(['All', ...list]);
    };
    fetchProvinces();
  }, []);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      setIsShowingGoogleResults(false); // Reset trạng thái khi tải từ DB
      let data = [];
      if (selectedProvince === 'All') {
        data = await getAllPlaces();
      } else {
        data = await getPlacesByProvince(selectedProvince);
      }
      setPlaces(data);
    } catch (error) {
      console.error('Failed to load places:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [selectedProvince]);

  // Nếu đang hiển thị kết quả Google, ta hiển thị toàn bộ danh sách trả về
  // Ngược lại, áp dụng bộ lọc tìm kiếm local cho database
  const filteredPlaces = isShowingGoogleResults ? places : places.filter((place) =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryEmoji = (category) => {
    const map = {
      'History': '🏛️',
      'Beach': '🏖️',
      'Mountain': '🏔️',
      'Food': '🍜',
      'Culture': '🎨',
      'Nature': '🌲',
      'Hotel': '🏨',
      'Google Place': '📍',
    };
    return map[category] || '📍';
  };

  const handleSeedData = async () => {
    setSeeding(true);
    const success = await seedPlaces();
    if (success) {
      alert('Đã khởi tạo dữ liệu mẫu thành công!');
      fetchPlaces(); // Reload list
    }
    setSeeding(false);
  };

  const handleGoogleSearch = async () => {
    if (selectedProvince === 'All') {
      alert('Vui lòng chọn một tỉnh thành cụ thể để tìm kiếm trên Google.');
      return;
    }
    setLoading(true);
    try {
      const googlePlaces = await searchPlacesViaGoogle(searchQuery, selectedProvince);
      if (googlePlaces.length > 0) {
        setPlaces(googlePlaces); // Hiển thị kết quả từ Google (không lưu vào DB ngay để tránh rác)
        setIsShowingGoogleResults(true); // Đánh dấu là đang hiển thị kết quả Google
      } else {
        alert('Không tìm thấy kết quả nào từ Google hoặc chưa cấu hình API Key.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlacePress = async (place) => {
    if (place.id) {
      router.push(`/places/${place.id}`);
    } else {
      // Nếu là địa điểm từ Google (chưa có ID), lưu vào DB trước khi xem chi tiết
      try {
        setLoading(true);
        const newId = await addPlace(place);
        router.push(`/places/${newId}`);
      } catch (error) {
        console.error('Error saving place:', error);
        alert('Có lỗi khi mở địa điểm này.');
      } finally {
        setLoading(false);
      }
    }
  };

  const renderProvinceItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.provinceChip,
        selectedProvince === item && styles.provinceChipActive
      ]}
      onPress={() => setSelectedProvince(item)}
    >
      <Text
        style={[
          styles.provinceText,
          selectedProvince === item && styles.provinceTextActive
        ]}
      >
        {item === 'All' ? 'Tất cả' : item}
      </Text>
    </TouchableOpacity>
  );

  const renderPlaceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.placeCard}
      onPress={() => handlePlacePress(item)}
    >
      <Image
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x200' }}
        style={styles.placeImage}
        resizeMode="cover"
      />
      <View style={styles.placeContent}>
        <View style={styles.placeHeader}>
          <Text style={styles.placeName}>{item.name}</Text>
          {item.rating && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {item.rating}</Text>
            </View>
          )}
        </View>
        <View style={styles.placeMetaRow}>
          <View style={styles.categoryBadge}><Text style={styles.categoryText}>{getCategoryEmoji(item.category)} {item.category}</Text></View>
          <Text style={styles.placeProvince}>📍 {item.province}</Text>
        </View>
        <Text style={styles.placeDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Khám Phá Điểm Đến Hấp Dẫn</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm địa điểm, trải nghiệm..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          data={provinces}
          renderItem={renderProvinceItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.provinceList}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      ) : (
        <FlatList
          data={filteredPlaces}
          renderItem={renderPlaceItem}
          keyExtractor={(item) => item.id || item.name}
          contentContainerStyle={styles.placesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không tìm thấy địa điểm nào.</Text>
              
              {/* <TouchableOpacity 
                style={styles.seedButton} 
                onPress={handleSeedData}
                disabled={seeding}
              >
                {seeding ? <ActivityIndicator color="#FFF" /> : <Text style={styles.seedButtonText}>📥 Nhập dữ liệu từ Google</Text>}
              </TouchableOpacity>
              <Text style={styles.helperText}>(Lưu kết quả tìm kiếm vào Database)</Text> */}
              
              {/* Nút tìm kiếm bằng Google API */}
              {selectedProvince !== 'All' && (
                <TouchableOpacity style={[styles.seedButton, { backgroundColor: '#DB4437', marginTop: 10 }]} onPress={handleGoogleSearch}>
                  <Text style={styles.seedButtonText}>🔍 Tìm trên Google Maps</Text>
                </TouchableOpacity>
              )}
              
            </View>
          }
          ListFooterComponent={
            selectedProvince !== 'All' && filteredPlaces.length > 0 && (
              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>Chưa tìm thấy địa điểm ưng ý?</Text>
                <TouchableOpacity style={[styles.seedButton, { backgroundColor: '#DB4437' }]} onPress={handleGoogleSearch}>
                  <Text style={styles.seedButtonText}>🔍 Tìm thêm trên Google Maps</Text>
                </TouchableOpacity>
              </View>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#F0F2F5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingBottom: 10,
  },
  provinceList: {
    paddingHorizontal: 15,
  },
  provinceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  provinceChipActive: {
    backgroundColor: '#E0E7FF',
    borderColor: '#667eea',
  },
  provinceText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  provinceTextActive: {
    color: '#667eea',
    fontWeight: '700',
  },
  placesList: {
    padding: 15,
  },
  placeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeImage: {
    width: '100%',
    height: 180,
  },
  placeContent: {
    padding: 15,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  placeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 10,
  },
  ratingBadge: {
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 5,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FBC02D',
  },
  categoryBadge: {
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  placeProvince: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  placeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  seedButton: {
    marginTop: 20,
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  seedButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footerContainer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    color: '#666',
    marginBottom: 10,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
});

export default DiscoverPlacesScreen;
