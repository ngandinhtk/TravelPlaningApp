import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/common/BackButton';
import CustomModal from '../../components/common/Modal';
import { checkTemplateNameExists, createTemplate } from '../../services/templateService';

const CreateTemplateScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [template, setTemplate] = useState({
    name: '',
    destination: '',
    duration: '',
    tripType: '',
    budgetMin: '',
    budgetMax: '',
    highlights: '', // Comma-separated string
  });

  const handleInputChange = (field, value) => {
    setTemplate(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveTemplate = async () => {
    console.log(template.name);
    
    if (!template.name || !template.destination || !template.duration) {
      setError('Vui lòng điền các trường bắt buộc: Tên, Điểm đến, Số ngày.');
      return;
    }

    setLoading(true);
    try {

      const nameExist = await checkTemplateNameExists(template.name.trim());
      if(nameExist){
        setError('permission-denied, Temolate name already exists');
        return;
      }

      const newTemplate = {
        id: 'template-' + Date.now(), // ID sẽ được Firestore tạo tự động
        name: template.name,
        destination: template.destination,
        duration: parseInt(template.duration, 10),
        tripType: template.tripType,
        budget:{
        budgetMin: parseInt(template.budgetMin, 10) || 0,
        budgetMax: parseInt(template.budgetMax, 10) || 0,
        },
        highlights: template.highlights.split(',').map(h => h.trim()),
        itinerary: [], // Itinerary creation can be a future enhancement
      };
      // c \ onsole.log(newTemplate);
      await createTemplate(newTemplate);

      setSuccessMessage('Đã tạo template mới thành công!');

    } catch (error) {
      console.error("Failed to create template:", error);
      if (error.message.includes('permission-denied')) {
        setError('Tên template này đã tồn tại hoặc bạn không có quyền tạo template.');
      } else {
        setError('Không thể tạo template. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

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
        onClose={() => {
          setSuccessMessage(null);
          router.back();
        }}
        onConfirm={() => {
          setSuccessMessage(null);
          router.back();
        }}
      >
        <Text>{successMessage}</Text>
      </CustomModal>

      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Tạo Template Mới</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tên Template (*)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Đà Lạt Lãng Mạn 3N2Đ"
            value={template.name}
            onChangeText={text => handleInputChange('name', text)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Điểm đến (*)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Đà Lạt"
            value={template.destination}
            onChangeText={text => handleInputChange('destination', text)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Số ngày (*)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: 3"
            value={template.duration}
            onChangeText={text => handleInputChange('duration', text)}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Loại hình chuyến đi</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: romantic, adventure"
            value={template.tripType}
            onChangeText={text => handleInputChange('tripType', text)}
          />
        </View>

        <View style={styles.budgetContainer}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.inputLabel}>Ngân sách (Tối thiểu)</Text>
            <TextInput style={styles.input} placeholder="4000000" value={template.budgetMin} onChangeText={text => handleInputChange('budgetMin', text)} keyboardType="number-pad" />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Ngân sách (Tối đa)</Text>
            <TextInput style={styles.input} placeholder="6000000" value={template.budgetMax} onChangeText={text => handleInputChange('budgetMax', text)} keyboardType="number-pad" />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Điểm nổi bật (phân cách bởi dấu phẩy)</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Cafe view đẹp, Ngắm hoàng hôn, ..."
            value={template.highlights}
            onChangeText={text => handleInputChange('highlights', text)}
            multiline
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveTemplate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Lưu Template</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#fff' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  formContainer: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  budgetContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  saveButton: { backgroundColor: '#28a745', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default CreateTemplateScreen;