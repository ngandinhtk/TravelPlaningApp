import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Loading from "../../components/common/Loading";
import CustomModal from "../../components/common/Modal";
import { useTrip } from "../../context/TripContext";
import { showToast } from "../../lib/showToast";
import { updateTrip } from "../../services/tripService";

const CHECKLIST_CATEGORIES = {
  Clothing: { icon: "👕", label: "Trang phục", color: "#3498db" },
  Toiletries: { icon: "🪥", label: "Vệ sinh cá nhân", color: "#1abc9c" },
  Electronics: { icon: "🔌", label: "Điện tử", color: "#9b59b6" },
  Documents: { icon: "📄", label: "Giấy tờ", color: "#e74c3c" },
  Health: { icon: "💊", label: "Y tế", color: "#e67e22" },
  Other: { icon: "🎒", label: "Khác", color: "#95a5a6" },
};

const PACKING_TEMPLATES = {
  "Biển 🏖️": [
    { text: "Đồ bơi", category: "Clothing" },
    { text: "Kem chống nắng", category: "Toiletries" },
    { text: "Kính râm", category: "Other" },
    { text: "Khăn tắm", category: "Toiletries" },
    { text: "Dép lào", category: "Clothing" },
    { text: "Mũ rộng vành", category: "Clothing" },
  ],
  "Núi 🏔️": [
    { text: "Giày leo núi", category: "Clothing" },
    { text: "Áo khoác gió/mưa", category: "Clothing" },
    { text: "Thuốc chống côn trùng", category: "Health" },
    { text: "Đèn pin", category: "Electronics" },
    { text: "Balo", category: "Other" },
    { text: "Nước uống", category: "Health" },
  ],
  "Thành phố 🏙️": [
    { text: "Giày đi bộ thoải mái", category: "Clothing" },
    { text: "Sạc dự phòng", category: "Electronics" },
    { text: "Ô/Dù", category: "Other" },
    { text: "Bản đồ/App offline", category: "Other" },
    { text: "Ví tiền & Giấy tờ", category: "Documents" },
  ],
  "Công tác 💼": [
    { text: "Laptop & Sạc", category: "Electronics" },
    { text: "Trang phục công sở", category: "Clothing" },
    { text: "Sổ tay & Bút", category: "Other" },
    { text: "Danh thiếp", category: "Documents" },
    { text: "Passport", category: "Documents" },
    { text: "Giày tây/Cao gót", category: "Clothing" },
  ],
};

const ChecklistScreen = () => {
  const router = useRouter();
  const { trip, setTrip } = useTrip();
  const [packingList, setPackingList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Clothing");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (trip?.packingList) {
      setPackingList(trip.packingList);
    }
  }, [trip]);

  const progress = useMemo(() => {
    if (packingList.length === 0) return 0;
    const checkedCount = packingList.filter((item) => item.isChecked).length;
    return (checkedCount / packingList.length) * 100;
  }, [packingList]);

  const groupedItems = useMemo(() => {
    const groups = {};
    Object.keys(CHECKLIST_CATEGORIES).forEach((key) => {
      groups[key] = [];
    });

    packingList.forEach((item, index) => {
      const cat = CHECKLIST_CATEGORIES[item.category] ? item.category : "Other";
      groups[cat].push({ ...item, originalIndex: index });
    });
    return groups;
  }, [packingList]);

  const handleToggleItem = (originalIndex) => {
    const newList = [...packingList];
    newList[originalIndex].isChecked = !newList[originalIndex].isChecked;
    setPackingList(newList);
  };

  const handleDeleteItem = (originalIndex) => {
    Alert.alert("Xóa mục", "Bạn có chắc muốn xóa mục này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          const newList = packingList.filter((_, i) => i !== originalIndex);
          setPackingList(newList);
        },
      },
    ]);
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    const newItem = {
      text: newItemName.trim(),
      category: newItemCategory,
      isChecked: false,
    };
    setPackingList([...packingList, newItem]);
    setNewItemName("");
    setIsModalVisible(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTrip(trip.id, { packingList });
      setTrip({ ...trip, packingList });
      showToast("Đã lưu danh sách hành lý!");
    } catch (error) {
      console.error("Error saving checklist:", error);
      Alert.alert("Lỗi", "Không thể lưu danh sách. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTemplate = (templateName) => {
    const newItems = PACKING_TEMPLATES[templateName].map((item) => ({
      text: item.text,
      category: item.category,
      isChecked: false,
    }));

    // Lọc các mục trùng lặp dựa trên tên
    const existingTexts = new Set(packingList.map((i) => i.text.toLowerCase()));
    const uniqueItems = newItems.filter(
      (i) => !existingTexts.has(i.text.toLowerCase()),
    );

    if (uniqueItems.length > 0) {
      setPackingList([...packingList, ...uniqueItems]);
      showToast(`Đã thêm ${uniqueItems.length} mục từ mẫu ${templateName}`);
    } else {
      showToast("Các mục trong mẫu này đã có trong danh sách!");
    }
    setIsTemplateModalVisible(false);
  };

  if (!trip) return <Loading message="Đang tải danh sách..." />;

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButtonTextWhite}>&larr; </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hành trang</Text>
        <TouchableOpacity
          onPress={() => setIsTemplateModalVisible(true)}
          style={styles.templateButton}
        >
          <Text
            style={[
              styles.templateButtonText,
              { color: "white", fontWeight: "bold" },
            ]}
          >
            📋 Mẫu
          </Text>
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? "Lưu..." : "Lưu"}</Text>
        </TouchableOpacity> */}
      </LinearGradient>

      <View style={styles.progressSection}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progress}%`, backgroundColor: "#2ecc71" },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Đã chuẩn bị {Math.round(progress)}%
        </Text>
      </View>

      <ScrollView style={styles.listContainer}>
        {Object.keys(groupedItems).map((catKey) => {
          const items = groupedItems[catKey];
          if (items.length === 0) return null;

          return (
            <View key={catKey} style={styles.categorySection}>
              <Text
                style={[
                  styles.categoryTitle,
                  { color: CHECKLIST_CATEGORIES[catKey].color },
                ]}
              >
                {CHECKLIST_CATEGORIES[catKey].icon}{" "}
                {CHECKLIST_CATEGORIES[catKey].label}
              </Text>
              {items.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => handleToggleItem(item.originalIndex)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        item.isChecked && styles.checkboxChecked,
                      ]}
                    >
                      {item.isChecked && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.itemText,
                        item.isChecked && styles.itemTextChecked,
                      ]}
                    >
                      {item.text}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteItem(item.originalIndex)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}
        {packingList.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Chưa có mục nào trong danh sách.
            </Text>
            <Text style={styles.emptyStateSubText}>
              Thêm đồ dùng cần thiết để không bị quên nhé!
            </Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <CustomModal
        visible={isModalVisible}
        title="Thêm đồ dùng mới"
        onClose={() => setIsModalVisible(false)}
        onConfirm={handleAddItem}
        confirmText="Thêm"
      >
        <TextInput
          style={styles.input}
          placeholder="Tên đồ dùng (VD: Sạc dự phòng)"
          value={newItemName}
          onChangeText={setNewItemName}
          autoFocus
        />
        <Text style={styles.modalLabel}>Chọn danh mục:</Text>
        <View style={styles.categoryPicker}>
          {Object.keys(CHECKLIST_CATEGORIES).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                newItemCategory === cat && {
                  backgroundColor: CHECKLIST_CATEGORIES[cat].color,
                  borderColor: CHECKLIST_CATEGORIES[cat].color,
                },
              ]}
              onPress={() => setNewItemCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  newItemCategory === cat && { color: "#fff" },
                ]}
              >
                {CHECKLIST_CATEGORIES[cat].icon}{" "}
                {CHECKLIST_CATEGORIES[cat].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </CustomModal>

      <CustomModal
        visible={isTemplateModalVisible}
        title="Chọn mẫu hành trang"
        onClose={() => setIsTemplateModalVisible(false)}
      >
        {Object.keys(PACKING_TEMPLATES).map((template) => (
          <TouchableOpacity
            key={template}
            style={styles.templateOption}
            onPress={() => handleApplyTemplate(template)}
          >
            <Text style={styles.templateOptionText}>{template}</Text>
          </TouchableOpacity>
        ))}
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF" },
  backButtonTextWhite: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  progressSection: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: { height: "100%", borderRadius: 4 },
  progressText: { textAlign: "right", color: "#666", fontSize: 13 },
  listContainer: { flex: 1, padding: 20 },
  categorySection: { marginBottom: 25 },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 5,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  checkboxContainer: { flexDirection: "row", alignItems: "center", flex: 1 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#ccc",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: { backgroundColor: "#2ecc71", borderColor: "#2ecc71" },
  checkmark: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  itemText: { fontSize: 16, color: "#333" },
  itemTextChecked: {
    color: "#aaa",
    textDecorationLine: "line-through",
  },
  deleteButton: { padding: 5 },
  deleteButtonText: { fontSize: 20, color: "#e74c3c", fontWeight: "bold" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  fabIcon: { fontSize: 30, color: "#fff" },
  emptyState: { alignItems: "center", marginTop: 50 },
  emptyStateText: { fontSize: 16, color: "#666", marginBottom: 5 },
  emptyStateSubText: { fontSize: 14, color: "#999" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  categoryPicker: { flexDirection: "row", flexWrap: "wrap" },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipText: { fontSize: 13, color: "#666" },
  templateOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  templateOptionText: { fontSize: 16, color: "#333" },
});

export default ChecklistScreen;
