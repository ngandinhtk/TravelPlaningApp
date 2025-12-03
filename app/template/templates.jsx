import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/common/BackButton';
import { getAllTemplates } from '../../services/templateService';

import LoadingScreen from '../../components/common/Loading';


const TemplateListScreen = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

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
    console.log(templates);
    
  }, []);

  const handleSelectTemplate = (template) => {
    // TODO: Navigate to a new screen to view/customize the template details
    // For now, we just log it and go back.
    // console.log('Selected Template:', template.id);
    alert(`Bạn đã chọn mẫu "${template.name}".\nTính năng tùy chỉnh sẽ được phát triển ở bước tiếp theo.`);
    // router.push(`/trip/${template.id}`);
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
});

export default TemplateListScreen;