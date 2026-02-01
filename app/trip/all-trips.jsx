import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTrip } from "../../context/TripContext";
import { useUser } from "../../context/UserContext";
import { getTrips } from "../../services/tripService";

const pulseAnim = new Animated.Value(0);
const SkeletonPlaceholder = ({ width, height, style }) => {
  useEffect(() => {
    const sharedAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 650,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 650,
          useNativeDriver: false,
        }),
      ]),
    );
    sharedAnimation.start();
    return () => sharedAnimation.stop();
  }, []);

  const backgroundColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E0E0E0", "#F0F0F0"],
  });

  return (
    <Animated.View
      style={[{ width, height, backgroundColor, borderRadius: 4 }, style]}
    />
  );
};

const AllTripsScreen = () => {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useUser();
  const { setSelectedTripId } = useTrip();

  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const tripsPerPage = 5;

  useFocusEffect(
    useCallback(() => {
      const fetchTrips = async () => {
        if (!isAuthLoading && user) {
          setIsLoading(true);
          try {
            const userTrips = await getTrips(user.uid);
            setTrips(userTrips);
          } catch (error) {
            console.error("Failed to fetch trips:", error);
          } finally {
            setIsLoading(false);
          }
        }
      };
      fetchTrips();
    }, [user, isAuthLoading]),
  );

  const onViewTrip = (trip) => {
    setSelectedTripId(trip.id);
    router.push("/trip/detail");
  };

  // Logic phân trang
  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = trips.slice(indexOfFirstTrip, indexOfLastTrip);
  const totalPages = Math.ceil(trips.length / tripsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const TripsList = ({ trips, onViewTrip }) =>
    trips.length === 0 ? (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🗺️</Text>
        <Text style={styles.emptyText}>Không tìm thấy chuyến đi nào</Text>
        <Text style={styles.emptySubtext}>
          Tạo chuyến đi đầu tiên để bắt đầu!
        </Text>
      </View>
    ) : (
      trips.map((trip) => (
        <TouchableOpacity
          key={trip.id}
          style={styles.tripCard}
          onPress={() => onViewTrip(trip)}
        >
          <LinearGradient
            colors={["#ffffff", "#f8f9fa"]}
            style={styles.tripCardGradient}
          >
            <View style={styles.tripCardHeader}>
              <Text style={styles.tripDestination}>{trip.destination}</Text>
              <Text style={styles.tripStatus}>{trip.status}</Text>
            </View>
            <Text style={styles.tripDates}>{trip.dates}</Text>
            <View style={styles.tripMeta}>
              <Text style={styles.tripMetaItem}>👥 {trip.travelers}</Text>
              <Text style={styles.tripMetaItem}>💰 ${trip.budget}</Text>
              <Text style={styles.tripMetaItem}>📅 {trip.days} ngày</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ))
    );

  const TripsListSkeleton = () => (
    <View style={styles.listContainer}>
      {[...Array(5)].map((_, index) => (
        <View
          key={index}
          style={[styles.tripCard, { backgroundColor: "#FFFFFF", padding: 16 }]}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <SkeletonPlaceholder width={120} height={20} />
            <SkeletonPlaceholder width={60} height={14} />
          </View>
          <SkeletonPlaceholder
            width={"70%"}
            height={16}
            style={{ marginBottom: 16 }}
          />
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <SkeletonPlaceholder width={50} height={14} />
            <SkeletonPlaceholder width={70} height={14} />
            <SkeletonPlaceholder width={60} height={14} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>&larr; Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tất cả chuyến đi</Text>
        <View style={{ width: 50 }} />
      </LinearGradient>

      {isLoading ? (
        trips.length > 10 ? (
          <TripsListSkeleton />
        ) : null
      ) : (
        <ScrollView style={styles.listContainer}>
          <TripsList trips={currentTrips} onViewTrip={onViewTrip} />
          {totalPages > 1 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                onPress={handlePrevPage}
                disabled={currentPage === 1}
                style={[
                  styles.pageButton,
                  currentPage === 1 && styles.disabledButton,
                ]}
              >
                <Text style={styles.pageButtonText}>Trước</Text>
              </TouchableOpacity>
              <Text
                style={styles.pageIndicator}
              >{`Trang ${currentPage} của ${totalPages}`}</Text>
              <TouchableOpacity
                onPress={handleNextPage}
                disabled={currentPage === totalPages}
                style={[
                  styles.pageButton,
                  currentPage === totalPages && styles.disabledButton,
                ]}
              >
                <Text style={styles.pageButtonText}>Sau</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
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
    paddingTop: 40,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF" },
  backButton: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  listContainer: { flex: 1, padding: 20, marginBottom: 0 },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyIcon: { fontSize: 60, marginBottom: 15 },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  emptySubtext: { fontSize: 14, color: "#666" },
  tripCard: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripCardGradient: { padding: 16 },
  tripCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tripDestination: { fontSize: 18, fontWeight: "bold", color: "#1A1A1A" },
  tripStatus: { fontSize: 12, color: "#666" },
  tripDates: { fontSize: 14, color: "#666", marginBottom: 12 },
  tripMeta: { flexDirection: "row", justifyContent: "space-between" },
  tripMetaItem: { fontSize: 12, color: "#666" },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  pageButton: {
    backgroundColor: "#667eea",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  pageButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#C0C0C0",
  },
  pageIndicator: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});

export default AllTripsScreen;
