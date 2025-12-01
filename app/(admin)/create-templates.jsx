import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/common/BackButton';
import { checkTemplateNameExists, createTemplate } from '../../services/templateService';

const CreateTemplateScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    if (!template.name || !template.destination || !template.duration) {
      Alert.alert('Lỗi', 'Vui lòng điền các trường bắt buộc: Tên, Điểm đến, Số ngày.');
      return;
    }

    setLoading(true);
    try {
      // Check if template name already exists
      const nameExists = await checkTemplateNameExists(template.name.trim());
      if (nameExists) {
        Alert.alert('Lỗi', 'Tên template này đã tồn tại. Vui lòng chọn một tên khác.');
        setLoading(false); // Stop loading because we are showing an alert
        return;
      }
      const newTemplate = {
        name: template.name,
        destination: template.destination,
        duration: parseInt(template.duration, 10),
        tripType: template.tripType,
        budget: {
          min: parseInt(template.budgetMin, 10) || 0,
          max: parseInt(template.budgetMax, 10) || 0,
        },
        highlights: template.highlights.split(',').map(h => h.trim()),
        itinerary: [], // Itinerary creation can be a future enhancement
      };

      await createTemplate(newTemplate);

      Alert.alert('Thành công', 'Đã tạo template mới thành công!', [
        { text: 'OK', onPress: () => router.back() },
      ]);

    } catch (error) {
      console.error("Failed to create template:", error);
      Alert.alert('Lỗi', 'Không thể tạo template. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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