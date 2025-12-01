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
  const [modalState, setModalState] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleConfirmAction = () => {
    modalState.onConfirm();
    setModalState({ ...modalState, visible: false });
  }

  useFocusEffect(
    useCallback(() => {
      const fetchTemplates = async () => {
        setLoading(true);
        try {
          const data = await getAllTemplates();
          setTemplates(data);
        } catch (error) {
          console.error("Failed to fetch templates:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTemplates();
    }, [])
  );

  const handleDeleteTemplate = (template) => {
    // console.log(template, templates);
    
    setModalState({
      visible: true,
      title: 'Xác nhận xóa template',
      message: `Bạn có chắc muốn xóa vĩnh viễn template ${template.name}? Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          await deleteTemplate(template.id);
          setTemplates(currentTemplates => currentTemplates.filter(t => t.id !== template.id));
        } catch (error) {
          console.error("Error deleting template:", error);
          // Có thể hiển thị một modal lỗi khác ở đây
        }
      },
    });
  };


  const renderTemplateItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardDescription}>Điểm đến: {item.destination}</Text>
      <Text style={styles.cardDescription}>Thời gian: {item.duration} ngày</Text>
      <TouchableOpacity onPress={() => handleDeleteTemplate(item)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Xóa</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomModal
        visible={modalState.visible}
        title={modalState.title}
        onClose={() => setModalState({ ...modalState, visible: false })}
        onConfirm={handleConfirmAction}
      >
        <Text>{modalState.message}</Text>
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
        onRefresh={() => {}} // You can re-implement fetch logic here if needed
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
    cardIcon: { fontSize: 30, marginBottom: 10 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    cardTitleAction: { fontSize: 18, fontWeight: 'bold', color: '#005249', marginBottom: 5 },
    cardDescription: { fontSize: 14, color: '#555' },
    cardDescriptionAction: { fontSize: 14, color: '#005249' },
    deleteButton: {
      backgroundColor: '#d45b4dff',
      padding: 8,
      borderRadius: 5,
      marginTop: 10,
      width: 80,
    },
    deleteButtonText: {
      color: '#fff',
      textAlign: 'center',
    },
});
    