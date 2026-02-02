import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Download, Plus, Trash2 } from "lucide-react-native";
// import {   } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CustomModal from "../../components/common/Modal";
import { useUser } from "../../context/UserContext";
import { showToast } from "../../lib/showToast";
import {
  applyTemplateToTrip,
  getTrip,
  getTripTemplates,
  updateTrip,
} from "../../services/tripService";
import ItineraryItem from "../itinerary/ItineraryItem";

const ItineraryScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [itinerary, setItinerary] = useState([]);

  // Activity Form State
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [activityForm, setActivityForm] = useState({
    title: "",
    time: "",
    location: "",
    category: "Sightseeing",
    notes: "",
  });

  // Template states
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState(null);
  const [previousTripState, setPreviousTripState] = useState(null);

  const categories = ["Sightseeing", "Food", "Transport", "Hotel", "Other"];

  useEffect(() => {
    const fetchTripData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getTrip(id);
        setTrip(data);
        // Khởi tạo itinerary nếu chưa có
        // Cấu trúc mong đợi: [{ day: 1, activities: [] }, ...]
        if (
          data.itinerary &&
          Array.isArray(data.itinerary) &&
          data.itinerary.length > 0
        ) {
          setItinerary(data.itinerary);
        } else {
          // Tạo khung itinerary trống dựa trên số ngày
          const daysCount = data.days || 1;
          const initialItinerary = Array.from(
            { length: daysCount },
            (_, i) => ({
              day: i + 1,
              activities: [],
            }),
          );
          setItinerary(initialItinerary);
        }
      } catch (error) {
        console.error("Error fetching trip:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [id]);

  const handleAddActivity = () => {
    setEditingActivityId(null);
    setActivityForm({
      title: "",
      time: "",
      location: "",
      category: "Sightseeing",
      notes: "",
    });
    setIsActivityModalVisible(true);
  };

  const handleEditActivity = (activity) => {
    setEditingActivityId(activity.id);
    setActivityForm({
      title: activity.title || "",
      time: activity.time || "",
      location: activity.location || "",
      category: activity.category || "Sightseeing",
      notes: activity.notes || "",
    });
    setIsActivityModalVisible(true);
  };

  const handleSaveActivity = async () => {
    if (!activityForm.title.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên hoạt động");
      return;
    }

    const newActivity = {
      id: editingActivityId || Date.now().toString(),
      ...activityForm,
    };

    const updatedItinerary = itinerary.map((dayItem) => {
      if (dayItem.day === selectedDay) {
        let newActivities = [...(dayItem.activities || [])];
        if (editingActivityId) {
          newActivities = newActivities.map((act) =>
            act.id === editingActivityId ? newActivity : act,
          );
        } else {
          newActivities.push(newActivity);
        }
        // Sort by time string simple comparison
        newActivities.sort((a, b) =>
          (a.time || "").localeCompare(b.time || ""),
        );
        return { ...dayItem, activities: newActivities };
      }
      return dayItem;
    });

    setItinerary(updatedItinerary);
    setIsActivityModalVisible(false);

    try {
      await updateTrip(id, { itinerary: updatedItinerary });
      showToast(
        editingActivityId ? "Đã cập nhật hoạt động" : "Đã thêm hoạt động",
      );
    } catch (error) {
      console.error("Error saving activity:", error);
      Alert.alert("Lỗi", "Không thể lưu thay đổi");
    }
  };

  const handleDeleteActivity = (activityId) => {
    const idToDelete =
      typeof activityId === "string" ? activityId : editingActivityId;
    if (!idToDelete) return;

    Alert.alert("Xóa hoạt động", "Bạn có chắc chắn muốn xóa hoạt động này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          const updatedItinerary = itinerary.map((dayItem) => {
            if (dayItem.day === selectedDay) {
              return {
                ...dayItem,
                activities: (dayItem.activities || []).filter(
                  (act) => act.id !== idToDelete,
                ),
              };
            }
            return dayItem;
          });

          setItinerary(updatedItinerary);
          setIsActivityModalVisible(false);

          try {
            await updateTrip(id, { itinerary: updatedItinerary });
            showToast("Đã xóa hoạt động");
          } catch (error) {
            console.error("Error deleting activity:", error);
          }
        },
      },
    ]);
  };

  const openTemplateModal = async () => {
    if (!trip) return;
    setIsTemplatesLoading(true);
    try {
      const fetched = await getTripTemplates();

      // Extract unique destinations from trip itinerary
      const tripDestinations = new Set();

      if (trip.itinerary && trip.itinerary.length > 0) {
        trip.itinerary.forEach((day) => {
          if (day.destination) {
            const destLower = day.destination.toLowerCase().trim();
            if (destLower) tripDestinations.add(destLower);
          }
        });
      } else if (trip.destination) {
        const destinations = trip.destination
          .split(" - ")
          .map((d) => d.toLowerCase().trim())
          .filter((d) => d);
        destinations.forEach((d) => tripDestinations.add(d));
      }

      // Filter templates with strict matching
      const filtered = fetched.filter((t) => {
        if (!t.destination || tripDestinations.size === 0) return false;
        const templateDest = t.destination.toLowerCase().trim();
        for (let tripDest of tripDestinations) {
          const tripDestRegex = new RegExp(`\\b${tripDest}\\b`, "i");
          if (templateDest.match(tripDestRegex)) {
            return true;
          }
        }
        return false;
      });

      setTemplates(filtered);
      setIsTemplateModalVisible(true);
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setIsTemplatesLoading(false);
    }
  };

  const handleApplyTemplate = async (templateId) => {
    if (!user || !trip) return;

    setIsApplying(true);
    setApplyError(null);
    try {
      // Save state for undo
      setPreviousTripState({
        itinerary: trip.itinerary || [],
        packingList: trip.packingList || [],
        todoList: trip.todoList || [],
      });

      await applyTemplateToTrip(user.uid, trip.id, templateId, true);

      // Refresh trip data
      const updated = await getTrip(trip.id);
      setTrip(updated);
      if (updated.itinerary) {
        setItinerary(updated.itinerary);
      }

      showToast("Đã áp dụng lịch trình mẫu!");
      setIsTemplateModalVisible(false);
    } catch (error) {
      console.error("Failed to apply template:", error);
      setApplyError("Không thể áp template. Vui lòng thử lại.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleUndoApply = async () => {
    if (!previousTripState || !trip) return;
    setIsApplying(true);
    try {
      await updateTrip(trip.id, previousTripState);
      // Update local state
      const restoredTrip = { ...trip, ...previousTripState };
      setTrip(restoredTrip);
      if (restoredTrip.itinerary) {
        setItinerary(restoredTrip.itinerary);
      }
      setPreviousTripState(null);
      showToast("Đã hoàn tác thay đổi!");
    } catch (error) {
      console.error("Failed to undo:", error);
      setApplyError("Không thể hoàn tác. Vui lòng thử lại.");
    } finally {
      setIsApplying(false);
    }
  };

  const currentDayActivities =
    itinerary.find((i) => i.day === selectedDay)?.activities || [];

  const handleDragEnd = async ({ data }) => {
    const updatedItinerary = itinerary.map((dayItem) => {
      if (dayItem.day === selectedDay) {
        return { ...dayItem, activities: data };
      }
      return dayItem;
    });

    setItinerary(updatedItinerary);

    try {
      await updateTrip(id, { itinerary: updatedItinerary });
    } catch (error) {
      console.error("Error updating itinerary order:", error);
      showToast("Lỗi khi lưu thứ tự mới");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft color="#FFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {trip?.destination || "Lịch trình"}
          </Text>
          <View style={{ width: 24 }} />
          <View style={{ flexDirection: "row", gap: 15 }}>
            {previousTripState && (
              <TouchableOpacity
                onPress={handleUndoApply}
                disabled={isApplying}
                style={styles.headerButton}
              >
                <Text style={{ color: "#FFF", fontWeight: "bold" }}>↩</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={openTemplateModal}
              style={styles.headerButton}
            >
              <Download color="#FFF" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Day Selector */}
        <View style={styles.daySelectorContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daySelectorContent}
          >
            {itinerary.map((item) => (
              <TouchableOpacity
                key={item.day}
                style={[
                  styles.dayChip,
                  selectedDay === item.day && styles.dayChipActive,
                ]}
                onPress={() => setSelectedDay(item.day)}
              >
                <Text
                  style={[
                    styles.dayText,
                    selectedDay === item.day && styles.dayTextActive,
                  ]}
                >
                  Ngày {item.day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Activities List */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <DraggableFlatList
          data={currentDayActivities}
          onDragEnd={handleDragEnd}
          keyExtractor={(item) => item.id}
          renderItem={({ item, drag, isActive }) => (
            <ScaleDecorator>
              <ItineraryItem
                item={item}
                onPress={() => handleEditActivity(item)}
                onLongPress={drag}
                disabled={isActive}
                style={{ opacity: isActive ? 0.5 : 1 }}
              />
            </ScaleDecorator>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Chưa có hoạt động nào cho ngày {selectedDay}
              </Text>
              <Text style={styles.emptySubText}>
                Nhấn nút + để thêm hoạt động
              </Text>
            </View>
          }
        />
      </GestureHandlerRootView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddActivity}>
        <Plus color="#FFF" size={24} />
      </TouchableOpacity>

      {/* Add/Edit Activity Modal */}
      <CustomModal
        visible={isActivityModalVisible}
        title={editingActivityId ? "Chỉnh sửa hoạt động" : "Thêm hoạt động mới"}
        onClose={() => setIsActivityModalVisible(false)}
        onConfirm={handleSaveActivity}
        confirmText="Lưu"
      >
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Tên hoạt động *</Text>
          <TextInput
            style={styles.input}
            value={activityForm.title}
            onChangeText={(t) => setActivityForm({ ...activityForm, title: t })}
            placeholder="Ví dụ: Ăn tối, Tham quan..."
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.inputLabel}>Thời gian</Text>
              <TextInput
                style={styles.input}
                value={activityForm.time}
                onChangeText={(t) =>
                  setActivityForm({ ...activityForm, time: t })
                }
                placeholder="08:00"
              />
            </View>
            <View style={{ flex: 2 }}>
              <Text style={styles.inputLabel}>Địa điểm</Text>
              <TextInput
                style={styles.input}
                value={activityForm.location}
                onChangeText={(t) =>
                  setActivityForm({ ...activityForm, location: t })
                }
                placeholder="Tên địa điểm..."
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Danh mục</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  activityForm.category === cat && styles.categoryChipActive,
                ]}
                onPress={() =>
                  setActivityForm({ ...activityForm, category: cat })
                }
              >
                <Text
                  style={[
                    styles.categoryText,
                    activityForm.category === cat && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Ghi chú</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            value={activityForm.notes}
            onChangeText={(t) => setActivityForm({ ...activityForm, notes: t })}
            multiline
            placeholder="Ghi chú thêm..."
          />

          {editingActivityId && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteActivity}
            >
              <Trash2 size={20} color="#ff4757" />
              <Text style={styles.deleteButtonText}>Xóa hoạt động này</Text>
            </TouchableOpacity>
          )}
        </View>
      </CustomModal>

      {/* Template Modal */}
      <CustomModal
        visible={isTemplateModalVisible}
        title="Chọn template để áp vào chuyến đi"
        onClose={() => setIsTemplateModalVisible(false)}
      >
        {isTemplatesLoading ? (
          <ActivityIndicator size="large" color="#667eea" />
        ) : (
          <>
            {applyError && <Text style={{ color: "red" }}>{applyError}</Text>}
            {templates.length === 0 ? (
              <Text
                style={{ textAlign: "center", marginTop: 20, color: "#666" }}
              >
                Không tìm thấy lịch trình mẫu nào cho {trip?.destination}.
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 400 }}>
                {templates.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => handleApplyTemplate(t.id)}
                    style={styles.templateItem}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.templateName}>{t.name}</Text>
                      {t.destination && (
                        <Text style={styles.templateDestination}>
                          📍 {t.destination}
                        </Text>
                      )}
                      {t.duration && (
                        <Text style={styles.templateInfo}>
                          ⏱️ {t.duration} ngày
                        </Text>
                      )}
                      {t.description && (
                        <Text style={styles.templateDesc}>{t.description}</Text>
                      )}
                    </View>
                    <Text style={styles.selectIcon}>›</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            {isApplying && (
              <Text style={{ textAlign: "center", marginTop: 10 }}>
                Đang áp dụng...
              </Text>
            )}
          </>
        )}
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    flex: 1,
    textAlign: "center",
  },
  daySelectorContainer: {
    height: 40,
  },
  daySelectorContent: {
    paddingHorizontal: 15,
  },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 5,
  },
  dayChipActive: {
    backgroundColor: "#FFF",
  },
  dayText: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },
  dayTextActive: {
    color: "#667eea",
    fontWeight: "bold",
  },
  listContent: {
    padding: 20,
    paddingBottom: 80,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  templateItem: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 6,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#667eea",
    alignItems: "center",
    justifyContent: "space-between",
  },
  templateName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  templateDestination: {
    fontSize: 13,
    color: "#667eea",
    marginBottom: 2,
    fontWeight: "500",
  },
  templateInfo: { fontSize: 12, color: "#666", marginBottom: 4 },
  templateDesc: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginTop: 4,
  },
  selectIcon: { fontSize: 24, color: "#667eea", marginLeft: 8 },
  formContainer: { paddingVertical: 10 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  row: { flexDirection: "row" },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  categoryChipActive: {
    backgroundColor: "#eef0ff",
    borderColor: "#667eea",
  },
  categoryText: { fontSize: 12, color: "#666" },
  categoryTextActive: { color: "#667eea", fontWeight: "600" },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    padding: 10,
    backgroundColor: "#ffe5e5",
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "#ff4757",
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default ItineraryScreen;
