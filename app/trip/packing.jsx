import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomModal from "../../components/common/Modal";
import { useTrip } from "../../context/TripContext";
import { showToast } from "../../lib/showToast";
import { updateTrip } from "../../services/tripService";

const PACKING_TEMPLATES = {
  "Biển 🏖️": [
    { text: "Đồ bơi", category: "Clothing" },
    { text: "Kem chống nắng", category: "Toiletries" },
    { text: "Kính râm", category: "Accessories" },
    { text: "Khăn tắm", category: "Accessories" },
    { text: "Dép lào", category: "Clothing" },
    { text: "Mũ rộng vành", category: "Accessories" },
  ],
  "Núi 🏔️": [
    { text: "Giày leo núi", category: "Clothing" },
    { text: "Áo khoác gió/mưa", category: "Clothing" },
    { text: "Thuốc chống côn trùng", category: "Toiletries" },
    { text: "Đèn pin", category: "Gear" },
    { text: "Balo", category: "Gear" },
    { text: "Nước uống", category: "Food" },
  ],
  "Thành phố 🏙️": [
    { text: "Giày đi bộ thoải mái", category: "Clothing" },
    { text: "Sạc dự phòng", category: "Electronics" },
    { text: "Ô/Dù", category: "Accessories" },
    { text: "Bản đồ/App offline", category: "Misc" },
    { text: "Ví tiền & Giấy tờ", category: "Essentials" },
  ],
  "Công tác 💼": [
    { text: "Laptop & Sạc", category: "Electronics" },
    { text: "Trang phục công sở", category: "Clothing" },
    { text: "Sổ tay & Bút", category: "Work" },
    { text: "Danh thiếp", category: "Work" },
    { text: "Giày tây/Cao gót", category: "Clothing" },
  ],
};

const TODO_SUGGESTIONS = [
  { text: "Đặt vé máy bay ✈️", category: "Booking" },
  { text: "Đặt khách sạn 🏨", category: "Booking" },
  { text: "Xin Visa 🛂", category: "Documents" },
  { text: "Mua bảo hiểm du lịch 🛡️", category: "Documents" },
  { text: "Đổi tiền 💱", category: "Essentials" },
  { text: "Mua SIM du lịch 📱", category: "Essentials" },
  { text: "Check-in online 🎫", category: "Travel" },
  { text: "Gửi lịch trình cho người thân 📧", category: "Safety" },
];

const PackingListScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { trip, setTrip } = useTrip();
  const flatListRef = useRef(null);

  const [activeTab, setActiveTab] = useState("packing"); // 'packing' | 'todo'

  const [newItemText, setNewItemText] = useState("");
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    if (params?.initialTab) {
      setActiveTab(params.initialTab);
    }
  }, [params]);

  useEffect(() => {
    setNewItemText("");
  }, [activeTab]);

  const packingItems = trip?.packingList || [];
  const todoItems = trip?.todoList || [];
  const currentItems = activeTab === "packing" ? packingItems : todoItems;

  const updateTripData = async (newItems, type) => {
    const field = type === "packing" ? "packingList" : "todoList";
    const updatedTrip = { ...trip, [field]: newItems };

    // Update context
    setTrip(updatedTrip);

    try {
      await updateTrip(trip.id, { [field]: newItems });
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    }
  };

  const handleToggleItem = (id) => {
    const updatedItems = currentItems.map((item) =>
      item.id === id ? { ...item, isChecked: !item.isChecked } : item,
    );
    updateTripData(updatedItems, activeTab);
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      isChecked: false,
      category: "Custom",
    };
    const updatedItems = [...currentItems, newItem];
    setNewItemText("");
    updateTripData(updatedItems, activeTab);
  };

  const handleDeleteItem = (id) => {
    const updatedItems = currentItems.filter((item) => item.id !== id);
    updateTripData(updatedItems, activeTab);
  };

  const handleApplyTemplate = (templateName) => {
    let newItemsToAdd = [];

    if (activeTab === "packing") {
      newItemsToAdd = PACKING_TEMPLATES[templateName].map((item, index) => ({
        id: Date.now().toString() + index,
        text: item.text,
        isChecked: false,
        category: item.category,
      }));
    } else {
      // Logic for Todo suggestions (if we treat them as a template)
      // Currently handled by a separate button for Todo
    }

    const updatedItems = [...currentItems, ...newItemsToAdd];
    updateTripData(updatedItems, activeTab);
    setIsTemplateModalVisible(false);
    showToast(`Đã thêm danh sách ${templateName}`);
  };

  const handleAddTodoSuggestions = () => {
    const newItems = TODO_SUGGESTIONS.map((item, index) => ({
      id: Date.now().toString() + index,
      text: item.text,
      isChecked: false,
      category: item.category,
    }));

    // Filter out duplicates based on text
    const existingTexts = new Set(todoItems.map((i) => i.text));
    const uniqueNewItems = newItems.filter((i) => !existingTexts.has(i.text));

    if (uniqueNewItems.length === 0) {
      showToast("Các mục gợi ý đã có trong danh sách!");
      return;
    }

    const updatedItems = [...todoItems, ...uniqueNewItems];
    updateTripData(updatedItems, "todo");
    showToast("Đã thêm các việc cần làm gợi ý!");
  };

  const calculateProgress = () => {
    if (currentItems.length === 0) return 0;
    const checkedCount = currentItems.filter((i) => i.isChecked).length;
    return Math.round((checkedCount / currentItems.length) * 100);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => handleToggleItem(item.id)}
      >
        <View
          style={[styles.checkbox, item.isChecked && styles.checkboxChecked]}
        >
          {item.isChecked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text
          style={[styles.itemText, item.isChecked && styles.itemTextChecked]}
        >
          {item.text}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleDeleteItem(item.id)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backButtonTextWhite}>&larr; </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === "packing" ? "Hành Trang" : "Việc Cần Làm"}
        </Text>
        {activeTab === "packing" ? (
          <TouchableOpacity
            onPress={() => setIsTemplateModalVisible(true)}
            style={styles.templateButton}
          >
            <Text style={styles.templateButtonText}>📋 Mẫu</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleAddTodoSuggestions}
            style={styles.templateButton}
          >
            <Text style={styles.templateButtonText}>💡 Gợi ý</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {activeTab === "packing" ? null : null}

      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>
          Tiến độ chuẩn bị: {calculateProgress()}%
        </Text>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${calculateProgress()}%` },
            ]}
          />
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        key={activeTab}
        data={currentItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === "packing"
                ? "Chưa có đồ dùng nào."
                : "Chưa có việc cần làm."}
            </Text>
            <Text style={styles.emptySubText}>
              {activeTab === "packing"
                ? "Thêm thủ công hoặc chọn mẫu có sẵn!"
                : "Thêm thủ công hoặc chọn gợi ý!"}
            </Text>
          </View>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder={
            activeTab === "packing" ? "Thêm đồ dùng..." : "Thêm việc cần làm..."
          }
          value={newItemText}
          onChangeText={setNewItemText}
          onSubmitEditing={handleAddItem}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

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
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 50,
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: { borderBottomColor: "#667eea" },
  tabText: { fontSize: 16, color: "#999", fontWeight: "600" },
  tabTextActive: { color: "#667eea" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF" },
  templateButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 8,
  },
  templateButtonText: { color: "#fff", fontWeight: "600" },
  progressContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  progressLabel: { marginBottom: 8, color: "#666", fontWeight: "600" },
  progressBarBg: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#2ecc71",
    borderRadius: 4,
  },
  backButtonTextWhite: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: { padding: 20, paddingBottom: 100 },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  checkboxContainer: { flexDirection: "row", alignItems: "center", flex: 1 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#667eea",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: { backgroundColor: "#667eea" },
  checkmark: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  itemText: { fontSize: 16, color: "#333" },
  itemTextChecked: { textDecorationLine: "line-through", color: "#999" },
  deleteButton: { padding: 8 },
  deleteButtonText: { color: "#e74c3c", fontSize: 18, fontWeight: "bold" },
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
    fontSize: 16,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { fontSize: 16, color: "#666", marginBottom: 5 },
  emptySubText: { fontSize: 14, color: "#999" },
  templateOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  templateOptionText: { fontSize: 16, color: "#333" },
});

export default PackingListScreen;
