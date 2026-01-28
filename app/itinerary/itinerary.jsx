import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Plus } from "lucide-react-native";
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
import { getTrip, updateTrip } from "../../services/tripService";
import ItineraryItem from "../itinerary/ItineraryItem";

const ItineraryScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [itinerary, setItinerary] = useState([]);

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
});

export default ItineraryScreen;
