import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FeedbackModal from "../../components/common/FeedbackModal";
import { IntelligenceCard } from "../../components/common/IntelligenceCard";
import CustomModal from "../../components/common/Modal";
import { useIntelligence } from "../../context/IntelligenceContext";
import { useTrip } from "../../context/TripContext";
import { useUser } from "../../context/UserContext";
import {
  calculateTripStatus,
  getTrips,
  getTripTemplates,
} from "../../services/tripService";
import { getUserProfile } from "../../services/userService";
const SkeletonPlaceholder = ({ width, height, style }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

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
  }, [pulseAnim]);

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

const HomeScreen = () => {
  // Use the user and the auth loading state from the context
  const { user, isLoading: isAuthLoading } = useUser();
  const { trackAction } = useIntelligence();
  const [trips, setTrips] = useState([]);
  const [isTripsLoading, setIsTripsLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplateDetail, setSelectedTemplateDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // const [selectedTemplateForExisting, setSelectedTemplateForExisting] = useState(null);

  const { setSelectedTripId } = useTrip(); // Lấy hàm để set ID từ context
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const fetchTrips = async () => {
        // Only fetch trips if authentication is complete and we have a user
        if (!isAuthLoading && user) {
          setIsTripsLoading(true);
          try {
            const userTrips = await getTrips(user.uid);
            // Track home page visit
            await trackAction(user.uid, "home_visit", "dashboard", {
              tripCount: userTrips.length,
            });
            // console.log(userTrips);
            getUserProfile(user.uid)
              .then((profile) => {})
              .catch((error) => {
                console.error("Error fetching user profile:", error);
              });
            setTrips(userTrips);
          } catch (error) {
            console.error("Failed to fetch trips:", error);
          } finally {
            setIsTripsLoading(false);
          }
        }

        // Fetch templates
        try {
          const fetchedTemplates = await getTripTemplates();
          setTemplates(fetchedTemplates);
        } catch (error) {
          console.error("Failed to fetch templates:", error);
        }
      };
      fetchTrips();
    }, [user, isAuthLoading, trackAction]),
  );
  const handleSelectTemplate = (template) => {
    setSelectedTemplateDetail(template);
    setShowDetailModal(true);
  };

  const handleCreateTrip = () => {
    // Track create trip action
    if (user) {
      trackAction(user.uid, "trip_create_initiated", "trip", {
        source: "home_screen",
      });
    }
    router.push("/trip/create");
  };

  const handleViewTrip = (trip) => {
    // Track trip view action
    if (user) {
      trackAction(user.uid, "trip_viewed", "trip", {
        tripId: trip.id,
        destination: trip.destination,
      });
    }

    setSelectedTripId(trip.id);
    router.push("/trip/detail");
  };

  const filteredTrips = trips.filter((trip) =>
    trip.destination.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  return (
    <View style={styles.homeContainer}>
      <CustomModal
        visible={showDetailModal}
        title={selectedTemplateDetail?.name || "Chi tiết lịch trình"}
        onClose={() => setShowDetailModal(false)}
      >
        {selectedTemplateDetail && (
          <ScrollView
            style={{ maxHeight: 500 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Điểm đến:</Text>
              <Text style={styles.detailValue}>
                {selectedTemplateDetail.destination}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Thời gian:</Text>
              <Text style={styles.detailValue}>
                {selectedTemplateDetail.duration} ngày
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Loại hình:</Text>
              <Text style={styles.detailValue}>
                {selectedTemplateDetail.tripType}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ngân sách:</Text>
              <Text style={styles.detailValue}>
                {(
                  (selectedTemplateDetail.budget?.budgetMin ||
                    selectedTemplateDetail.budgetMin ||
                    0) / 1000000
                ).toFixed(1)}{" "}
                -{" "}
                {(
                  (selectedTemplateDetail.budget?.budgetMax ||
                    selectedTemplateDetail.budgetMax ||
                    0) / 1000000
                ).toFixed(1)}{" "}
                triệu VND
              </Text>
            </View>

            <Text
              style={[styles.detailLabel, { marginTop: 10, marginBottom: 8 }]}
            >
              Điểm nổi bật:
            </Text>
            <View style={styles.highlightContainer}>
              {selectedTemplateDetail.highlights.map((h, index) => (
                <View key={index} style={styles.highlightBadge}>
                  <Text style={styles.highlightText}>{h}</Text>
                </View>
              ))}
            </View>

            <View style={styles.modalActionContainer}>
              {/* <TouchableOpacity
                style={[styles.modalButton, styles.importButton]}
                onPress={() => {
                  setShowDetailModal(false);
                  handleImportTemplate(selectedTemplateDetail);
                }}
              >
                <Text style={styles.modalButtonText}>Nhập mới</Text>
              </TouchableOpacity> */}
              {/* <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.applyButton,
                  selectedTemplateDetail?.isSample && {
                    backgroundColor: "#b0b0b0",
                  },
                ]}
                disabled={selectedTemplateDetail?.isSample}
                onPress={() => {
                  setShowDetailModal(false);
                }}
              >
                <Text style={styles.modalButtonText}>Áp dụng...</Text>
              </TouchableOpacity> */}
            </View>
          </ScrollView>
        )}
      </CustomModal>
      {/* Header */}
      <LinearGradient
        colors={["#5d75e2ff", "#764ba2"]}
        style={styles.homeHeader}
      >
        {isAuthLoading ? (
          <HeaderSkeleton />
        ) : (
          <HeaderContent user={user} router={router} />
        )}
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm điểm đến..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        {isTripsLoading ? (
          <StatsSkeleton />
        ) : (
          <StatsContent trips={filteredTrips} />
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          onPress={handleCreateTrip}
          style={styles.actionButton}
        >
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionButtonGradient}
          >
            <Text style={styles.createTripIcon}>✨</Text>
            <Text style={styles.createTripText}>Tạo chuyến</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/places/discover")}
          style={styles.actionButton}
        >
          <LinearGradient
            colors={["#f093fb", "#f5576c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionButtonGradient}
          >
            <Text style={styles.createTripIcon}>🌏</Text>
            <Text style={styles.createTripText}>Khám phá</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Trips List */}
      <ScrollView
        style={styles.tripsSection}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chuyến đi của bạn</Text>
          <TouchableOpacity
            onPress={() => router.push("trip/all-trips")}
            style={styles.seeAllButton}
          >
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        {isTripsLoading ? (
          <TripsSkeleton />
        ) : (
          <TripsContent trips={filteredTrips} onViewTrip={handleViewTrip} />
        )}

        {/* Recommended Templates Section */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gợi ý lịch trình</Text>
          <TouchableOpacity
            onPress={() => router.push("template/templates")}
            style={styles.seeAllButton}
          >
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.trendingScroll}
        >
          {templates.map((template, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSelectTemplate(template)}
              // onPress={() => router.push("template/templates")}
              style={{ marginRight: 15 }}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.templateCard}
              >
                <View style={styles.templateHeader}>
                  <View style={styles.templateIconBg}>
                    <Text style={styles.templateIcon}>✨</Text>
                  </View>
                  {template.duration && (
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationText}>
                        {template.duration} ngày
                      </Text>
                    </View>
                  )}
                </View>
                <View>
                  <Text style={styles.templateName} numberOfLines={2}>
                    {template.name}
                  </Text>
                  <Text style={styles.templateDesc} numberOfLines={1}>
                    {template.destination || "Khám phá ngay"}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Community Trips Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cộng đồng chia sẻ</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/community")}>
          <LinearGradient
            colors={["#4facfe", "#00f2fe"]}
            style={{
              marginHorizontal: 0,
              marginBottom: 20,
              padding: 20,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text
                style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
              >
                Khám phá chuyến đi
              </Text>
              <Text style={{ color: "white", opacity: 0.9 }}>
                Xem các chuyến đi từ cộng đồng
              </Text>
            </View>
            <Text style={{ fontSize: 30 }}>🌏</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Seasonal Recommendations Section */}
        {/* <SeasonalRecommendations /> */}

        {/* Recommended Destinations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Điểm đến thịnh hành</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.trendingScroll}
        >
          {[
            { emoji: "🗼", name: "Paris", color: "#FF6B6B" },
            { emoji: "🗽", name: "New York", color: "#4ECDC4" },
            { emoji: "🏯", name: "Tokyo", color: "#95E1D3" },
            { emoji: "🏖️", name: "Bali", color: "#F38181" },
          ].map((dest, index) => (
            <TouchableOpacity key={index}>
              <LinearGradient
                colors={[dest.color, dest.color + "CC"]}
                style={styles.trendingCard}
              >
                <Text style={styles.trendingEmoji}>{dest.emoji}</Text>
                <Text style={styles.trendingText}>{dest.name}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* AI Intelligence Section */}
        {!isAuthLoading && user && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🧠 Trí tuệ AI của bạn</Text>
            <TouchableOpacity
              onPress={() => router.push("/admin/intelligence")}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllText}>Xem chi tiết</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isAuthLoading && user && (
          <View style={{ height: 300, marginBottom: 20 }}>
            <IntelligenceCard
              userId={user.uid}
              onFeedbackPress={() => setShowFeedbackModal(true)}
            />
          </View>
        )}
      </ScrollView>

      {/* Feedback Modal */}
      {user && (
        <FeedbackModal
          isVisible={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          userId={user.uid}
          itemType="home_interaction"
          title="Bạn cảm thấy thế nào?"
        />
      )}
    </View>
  );
};

const HeaderSkeleton = () => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
    }}
  >
    <View>
      <SkeletonPlaceholder
        width={180}
        height={28}
        style={{ marginBottom: 8 }}
      />
      <SkeletonPlaceholder width={120} height={16} />
    </View>
    <SkeletonPlaceholder width={50} height={50} style={{ borderRadius: 25 }} />
  </View>
);

const HeaderContent = ({ user, router }) => (
  <>
    <View>
      <Text style={styles.greeting}>
        Xin chào, {user?.displayName || "bạn"}! 👋
      </Text>
      <Text style={styles.subGreeting}>Điểm đến tiếp theo của bạn?</Text>
    </View>
    <TouchableOpacity onPress={() => router.push("profile/profile")}>
      <Image
        source={
          user &&
          user.photoURL &&
          typeof user.photoURL === "string" &&
          user.photoURL.startsWith("http")
            ? { uri: user.photoURL }
            : require("../../lib/character.jpg")
        }
        style={styles.avatarImage}
      />
    </TouchableOpacity>
  </>
);

const StatsSkeleton = () => (
  <>
    <View style={styles.statCard}>
      <SkeletonPlaceholder width={40} height={28} />
      <SkeletonPlaceholder width={60} height={14} style={{ marginTop: 6 }} />
    </View>
    <View style={styles.statCard}>
      <SkeletonPlaceholder width={40} height={28} />
      <SkeletonPlaceholder width={60} height={14} style={{ marginTop: 6 }} />
    </View>
    <View style={styles.statCard}>
      <SkeletonPlaceholder width={40} height={28} />
      <SkeletonPlaceholder width={60} height={14} style={{ marginTop: 6 }} />
    </View>
  </>
);

const StatsContent = ({ trips }) => {
  const totalDestinations = new Set(trips.map((trip) => trip.destination)).size;
  const totalDays = trips.reduce((sum, trip) => sum + (trip.days || 0), 0);
  // const totalBudget = trips.reduce((sum, trip) => sum + (trip.budget || 0), 0);

  return (
    <>
      <View style={styles.statCard}>
        <Text style={[styles.statNumber]}>{totalDestinations}</Text>
        <Text style={styles.statLabel}>Điểm đến</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{trips.length}</Text>
        <Text style={styles.statLabel}>Chuyến đi</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{totalDays}</Text>
        <Text style={styles.statLabel}>Ngày</Text>
      </View>
    </>
  );
};

const TripsSkeleton = () => (
  <>
    {[1, 2].map((i) => (
      <View
        key={i}
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
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <SkeletonPlaceholder width={50} height={14} />
          <SkeletonPlaceholder width={70} height={14} />
          <SkeletonPlaceholder width={60} height={14} />
        </View>
      </View>
    ))}
  </>
);

const TripsContent = ({ trips, onViewTrip }) => {
  // Helper function to get status badge color and Vietnamese text
  const getStatusDisplay = (trip) => {
    const status = calculateTripStatus(trip);
    const statusMap = {
      Upcoming: { text: "Sắp tới", color: "#667eea", bgColor: "#E8EFFE" },
      Ongoing: { text: "Đang diễn ra", color: "#F5A623", bgColor: "#FEF3E8" },
      Completed: {
        text: "Đã hoàn thành",
        color: "#6FA65A",
        bgColor: "#E8F5E8",
      },
      Archived: { text: "Lưu trữ", color: "#999", bgColor: "#F0F0F0" },
    };
    return (
      statusMap[status] || { text: status, color: "#999", bgColor: "#F0F0F0" }
    );
  };

  return trips.length === 0 ? (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🗺️</Text>
      <Text style={styles.emptyText}>Chưa có chuyến đi nào</Text>
      <Text style={styles.emptySubtext}>
        Tạo chuyến đi đầu tiên để bắt đầu!
      </Text>
    </View>
  ) : (
    trips.slice(0, 3).map((trip, index) => {
      const statusDisplay = getStatusDisplay(trip);
      return (
        <TouchableOpacity
          key={index}
          style={styles.tripCard}
          onPress={() => onViewTrip(trip)}
        >
          <LinearGradient
            colors={["#ffffff", "#f8f9fa"]}
            style={styles.tripCardGradient}
          >
            <View style={styles.tripCardHeader}>
              <Text style={styles.tripDestination}>{trip.destination}</Text>
              <View
                style={[
                  styles.tripStatusBadge,
                  { backgroundColor: statusDisplay.bgColor },
                ]}
              >
                <Text
                  style={[styles.tripStatus, { color: statusDisplay.color }]}
                >
                  {statusDisplay.text}
                </Text>
              </View>
            </View>
            <Text style={styles.tripDates}>{trip.dates}</Text>
            <View style={styles.tripMeta}>
              <Text style={styles.tripMetaItem}>👥 {trip.travelers}</Text>
              <Text style={styles.tripMetaItem}>💰 ${trip.budget}</Text>
              <Text style={styles.tripMetaItem}>📅 {trip.days} ngày</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    })
  );
};

// Vui lòng thêm styles từ tệp gốc của bạn vào đây
const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  homeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subGreeting: {
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 4,
    opacity: 0.9,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    fontSize: 24,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    marginTop: -10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#667eea",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flex: 0.48,
    borderRadius: 12,
    overflow: "hidden",
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  createTripIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  createTripText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  tripsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  seeAllButton: {
    backgroundColor: "#eef0ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  seeAllText: {
    color: "#667eea",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
  },
  tripCard: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: "hidden",
  },
  tripCardGradient: {
    padding: 6,
  },
  tripCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tripDestination: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  tripStatus: {
    fontSize: 12,
    color: "#666",
  },
  tripStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  tripDates: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  tripMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tripMetaItem: {
    fontSize: 12,
    color: "#666",
  },
  trendingScroll: {
    marginBottom: 20,
  },
  trendingCard: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginRight: 12,
    alignItems: "center",
    minWidth: 100,
  },
  trendingEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  trendingText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  templateCard: {
    width: 200,
    height: 140,
    borderRadius: 16,
    padding: 16,
    justifyContent: "space-between",
  },
  templateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  templateIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  templateIcon: {
    fontSize: 18,
  },
  durationBadge: {
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },
  templateName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  templateDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },
  detailLabel: {
    fontWeight: "bold",
    color: "#333",
    width: 100,
    fontSize: 16,
  },
  detailValue: {
    color: "#555",
    flex: 1,
    fontSize: 16,
  },
  highlightContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  highlightBadge: {
    backgroundColor: "#eef0ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  highlightText: {
    color: "#667eea",
    fontSize: 14,
  },
  modalActionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  importButton: {
    backgroundColor: "#667eea",
  },
  applyButton: {
    backgroundColor: "#27ae60",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
});

export default HomeScreen;
