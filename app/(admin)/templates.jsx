import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BackButton from '../../components/common/BackButton';
import CustomModal from '../../components/common/Modal';
import { deleteTemplate, getAllTemplates } from '../../services/templateService';
  

const AdminTemplateScreen = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null); 


  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTemplates();
    }, [fetchTemplates])
  );


    const handleDelete = (id) => {  
      setTemplateToDelete(id);
      setIsDeleteModalVisible(true);
    };
  
    const confirmDelete = async () => {
      if (!templateToDelete) return;
      try {
        await deleteTemplate(templateToDelete);
        // Tải lại danh sách templates từ database để đảm bảo dữ liệu luôn mới nhất
        await fetchTemplates();
      } catch (e) {
        console.error('Lỗi khi xóa template:', e);
        setError('Không thể xóa template. Vui lòng thử lại.');
      } finally {
        setIsDeleteModalVisible(false); // Đóng modal
        setTemplateToDelete(null); // Reset ID
      }
    };
  
 
  const renderTemplateItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <View style={styles.cardContent}>
        <View>
          <Text style={styles.cardDescription}>Điểm đến: {item.destination}</Text>
          <Text style={styles.cardDescription}>Thời gian: {item.duration} ngày</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
       <CustomModal
        visible={!!error}
        title="Thông Báo Lỗi"
        onClose={() => setError(null)}
        onConfirm={() => setError(null)}
      >
        <Text>{error || deleteError}</Text>
      </CustomModal>

       <CustomModal
        visible={isDeleteModalVisible}
        title="Xác nhận xóa"
        onClose={() => {
          setIsDeleteModalVisible(false);
          setTemplateToDelete(null);
        }}
        onConfirm={confirmDelete}
      >
        <Text>Bạn có chắc chắn muốn xóa chuyến đi này không? Hành động này không thể hoàn tác.</Text>
      </CustomModal>

      <LinearGradient colors={['#93c7a5ff', '#68dfc9ff']} style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Quản lý Templates</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <FlatList
        data={templates}
        renderItem={renderTemplateItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Text style={styles.sectionTitle}>Hành động</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/create-templates')}>
              <LinearGradient colors={['#4ebd66ff', '#5bf7dabe']} style={styles.card}>
                <Text style={styles.cardIcon}>➕</Text>
                <Text style={styles.cardTitleAction}>Tạo Template Mới</Text>
                <Text style={styles.cardDescriptionAction}>Thêm một lịch trình mẫu vào hệ thống.</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Danh sách Templates</Text>
          </>
        }
        refreshing={loading}
        onRefresh={fetchTemplates}
      />
    </View>
  );
};
export default AdminTemplateScreen;
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
    content: { flex: 1, padding: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    card: { 
        padding: 20,
        borderRadius: 12,   
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    cardContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    cardIcon: { fontSize: 30, marginBottom: 10 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    cardTitleAction: { fontSize: 18, fontWeight: 'bold', color: '#005249', marginBottom: 5 },
    cardDescription: { fontSize: 14, color: '#555' },
    cardDescriptionAction: { fontSize: 14, color: '#005249' },
    deleteButton: {
      // backgroundColor: '#d45b4dff',
      padding: 8,
      borderRadius: 5,
      marginTop: 10,
      width: 80,
    },
    deleteButtonText: {
      color: '#341cc0ff',
      textAlign: 'center',
    },
});
    