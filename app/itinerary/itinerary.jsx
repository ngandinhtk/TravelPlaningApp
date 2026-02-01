import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Download, Plus } from "lucide-react-native";
// import {   } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomModal from "../../components/common/Modal";
import { useUser } from "../../context/UserContext";
import { showToast } from "../../lib/showToast";
import { applyTemplateToTrip, getTrip, getTripTemplates, updateTrip } from "../../services/tripService";
import ItineraryItem from "../itinerary/ItineraryItem";

const ItineraryScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [itinerary, setItinerary] = useState([]);

  // Template states
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState(null);
  const [previousTripState, setPreviousTripState] = useState(null);

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
    // TODO: Mở modal hoặc điều hướng đến trang chọn địa điểm
    // Đây là mock data để test tính năng
    const newActivity = {
      id: Date.now().toString(),
      title: "Hoạt động mới",
      time: "09:00",
      location: "Địa điểm chưa chọn",
      category: "Sightseeing",
      notes: "Chạm để chỉnh sửa",
    };

    const updatedItinerary = itinerary.map((dayItem) => {
      if (dayItem.day === selectedDay) {
        return {
          ...dayItem,
          activities: [...(dayItem.activities || []), newActivity],
        };
      }
      return dayItem;
    });

    setItinerary(updatedItinerary);

    // Lưu vào Firestore
    updateTrip(id, { itinerary: updatedItinerary }).catch((err) =>
      console.error(err),
    );
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
      <FlatList
        data={currentDayActivities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItineraryItem
            item={item}
            onPress={() => {
              /* TODO: Edit activity */
            }}
          />
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

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddActivity}>
        <Plus color="#FFF" size={24} />
      </TouchableOpacity>

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
});

export default ItineraryScreen;
