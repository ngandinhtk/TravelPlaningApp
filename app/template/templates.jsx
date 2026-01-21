import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "../../components/common/BackButton";
import LoadingScreen from "../../components/common/Loading";
import CustomModal from "../../components/common/Modal";
import { useTrip } from "../../context/TripContext";
import { useUser } from "../../context/UserContext";
import { seedTemplates } from "../../services/seedService";
import {
  applyTemplateToTrip,
  getTemplatesByRegion,
  getTrips,
  getTripTemplates,
} from "../../services/tripService";

import { showToast } from "../../lib/showToast";

const SAMPLE_TEMPLATES = [
  {
    name: "Đà Lạt - Thành phố ngàn hoa 🌸",
    destination: "Đà Lạt",
    duration: 3,
    budgetMin: 2000000,
    budgetMax: 4000000,
    tripType: "Relax",
    highlights: ["Hồ Xuân Hương", "Quảng trường Lâm Viên", "Chợ đêm Đà Lạt"],
    itinerary: [
      {
        day: 1,
        title: "Khám phá trung tâm",
        activities: [
          "Check-in khách sạn",
          "Dạo quanh Hồ Xuân Hương",
          "Ăn tối tại Chợ đêm",
        ],
      },
      {
        day: 2,
        title: "Săn mây & Hoa",
        activities: ["Đồi chè Cầu Đất", "Vườn hoa Cẩm Tú Cầu", "Ga Đà Lạt"],
      },
      {
        day: 3,
        title: "Cafe & Thư giãn",
        activities: ["Cafe Tùng", "Mua sắm đặc sản", "Ra sân bay"],
      },
    ],
    packingList: [
      { text: "Áo len/Áo khoác", category: "Clothing", isChecked: false },
      { text: "Ô trong suốt", category: "Accessories", isChecked: false },
      { text: "Giày đi bộ", category: "Clothing", isChecked: false },
    ],
  },
  {
    name: "Phú Quốc - Đảo Ngọc 🏝️",
    destination: "Phú Quốc",
    duration: 4,
    budgetMin: 5000000,
    budgetMax: 10000000,
    tripType: "Beach",
    highlights: ["Bãi Sao", "VinWonders", "Làng chài Hàm Ninh"],
    itinerary: [
      {
        day: 1,
        title: "Chào sân Phú Quốc",
        activities: ["Nhận phòng resort", "Ngắm hoàng hôn Sunset Sanato"],
      },
      {
        day: 2,
        title: "Khám phá Bắc Đảo",
        activities: ["VinWonders", "Vinpearl Safari", "Grand World"],
      },
      {
        day: 3,
        title: "Tour đảo",
        activities: ["Hòn Móng Tay", "Lặn ngắm san hô", "Cáp treo Hòn Thơm"],
      },
      {
        day: 4,
        title: "Tạm biệt",
        activities: ["Mua nước mắm/hồ tiêu", "Ra sân bay"],
      },
    ],
    packingList: [
      { text: "Đồ bơi", category: "Clothing", isChecked: false },
      { text: "Kem chống nắng", category: "Toiletries", isChecked: false },
      { text: "Kính râm", category: "Accessories", isChecked: false },
    ],
  },
  {
    name: "Hà Nội - Mùa thu lịch sử 🍂",
    destination: "Hà Nội",
    duration: 2,
    budgetMin: 1500000,
    budgetMax: 3000000,
    tripType: "Culture",
    highlights: ["Lăng Bác", "Hồ Gươm", "Phố cổ"],
    itinerary: [
      {
        day: 1,
        title: "Hà Nội nghìn năm văn hiến",
        activities: ["Viếng Lăng Bác", "Văn Miếu Quốc Tử Giám", "Dạo phố cổ"],
      },
      {
        day: 2,
        title: "Ẩm thực & Cafe",
        activities: ["Phở Bát Đàn", "Cafe Trứng", "Nhà Thờ Lớn"],
      },
    ],
    packingList: [
      { text: "Máy ảnh", category: "Electronics", isChecked: false },
      { text: "Giày thể thao", category: "Clothing", isChecked: false },
    ],
  },
];

const TemplateListScreen = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [importingStatus, setImportingStatus] = useState({});
  const [showTripPicker, setShowTripPicker] = useState(false);
  const [userTrips, setUserTrips] = useState([]);
  const [loadingUserTrips, setLoadingUserTrips] = useState(false);
  const [selectedTemplateForExisting, setSelectedTemplateForExisting] =
    useState(null);
  const [applyingToExisting, setApplyingToExisting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTemplateDetail, setSelectedTemplateDetail] = useState(null);
  const { user } = useUser();
  const { setSelectedTripId } = useTrip();
  const router = useRouter();

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        // Fetch unfiltered templates initially
        const fetchedTemplates = await getTripTemplates(50);
        if (fetchedTemplates.length > 0) {
          setTemplates(fetchedTemplates);
          // derive available regions from templates
          const regionSet = new Set(
            fetchedTemplates.map((t) => t.region).filter((r) => !!r),
          );
          setRegions(["All", ...Array.from(regionSet)]);
        } else {
          // If no templates in DB, show sample ones. Mark them as samples.
          const samplesWithId = SAMPLE_TEMPLATES.map((t, i) => ({
            ...t,
            id: `sample-${i}`,
            isSample: true,
          }));
          setTemplates(samplesWithId);
          setRegions(["All"]);
        }
      } catch (error) {
        console.error("Failed to fetch templates:", error);
        alert("Đã có lỗi xảy ra khi tải lịch trình mẫu.");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleSeedData = async () => {
    setLoading(true);
    try {
      const result = await seedTemplates();
      Alert.alert(result.success ? "Thành công" : "Thông báo", result.message);
      if (result.success) {
        const fetched = await getTripTemplates(50);
        setTemplates(fetched);
        const regionSet = new Set(
          fetched.map((t) => t.region).filter((r) => !!r),
        );
        setRegions(["All", ...Array.from(regionSet)]);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể thêm dữ liệu mẫu.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRegion = async (region) => {
    setSelectedRegion(region);
    setLoading(true);
    try {
      if (!region || region === "All") {
        const fetched = await getTripTemplates(50);
        setTemplates(fetched);
      } else {
        const fetched = await getTemplatesByRegion(region, 50);
        setTemplates(fetched);
      }
    } catch (err) {
      console.error("Failed to fetch templates by region:", err);
      Alert.alert("Lỗi", "Không thể tải mẫu theo vùng.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplateDetail(template);
    setShowDetailModal(true);
  };

  const handleOpenTripPicker = async (template) => {
    if (!user) {
      Alert.alert("Yêu cầu đăng nhập", "Bạn cần đăng nhập để áp dụng mẫu này.");
      return;
    }
    setSelectedTemplateForExisting(template);
    setLoadingUserTrips(true);
    setShowTripPicker(true);
    try {
      const trips = await getTrips(user.uid);
      setUserTrips(trips);
    } catch (err) {
      console.error("Failed to fetch user trips:", err);
      Alert.alert("Lỗi", "Không thể tải danh sách chuyến đi của bạn.");
      setShowTripPicker(false); // Close picker on error
    } finally {
      setLoadingUserTrips(false);
    }
  };

  const handleApplyToExistingTrip = async (trip) => {
    if (!selectedTemplateForExisting || applyingToExisting) return;

    setApplyingToExisting(true);
    try {
      await applyTemplateToTrip(
        user.uid,
        trip.id,
        selectedTemplateForExisting.id,
      );
      setSelectedTripId(trip.id);
      showToast("Đã áp dụng mẫu vào chuyến đi!");
      setShowTripPicker(false);
      router.push("/trip/detail");
    } catch (err) {
      console.error("Failed to apply template to existing trip:", err);
      Alert.alert("Lỗi", "Không thể áp dụng mẫu vào chuyến đi này.");
    } finally {
      setApplyingToExisting(false);
    }
  };

  const renderTemplateItem = ({ item }) => {
    const min = item.budget?.budgetMin || item.budgetMin || 0;
    const max = item.budget?.budgetMax || item.budgetMax || 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleSelectTemplate(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardBudget}>
            ~{(min / 1000000).toFixed(1)} - {(max / 1000000).toFixed(1)}tr
          </Text>
        </View>
        <Text style={styles.cardHighlights}>
          <Text style={{ fontWeight: "bold" }}>Nổi bật: </Text>
          {item.highlights.join(" • ")}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardTripType}>{item.tripType}</Text>
          {/* <TouchableOpacity
            onPress={() => handleImportTemplate(item)}
            style={{ marginLeft: 12 }}
            disabled={!!importingStatus[item.id]}
          >
            <Text style={{ color: "#667eea", fontWeight: "600" }}>
              {importingStatus[item.id] === "new" ? "Đang nhập..." : "Nhập mới"}
            </Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => handleOpenTripPicker(item)}
            style={{ marginLeft: 12 }}
            disabled={!!importingStatus[item.id] || item.isSample}
          >
            <Text
              style={{
                color: item.isSample ? "#b0b0b0" : "#27ae60",
                fontWeight: "600",
              }}
            >
              Áp dụng vào...
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>😢</Text>
      <Text style={styles.emptyText}>
        Không tìm thấy lịch trình mẫu nào phù hợp.
      </Text>
      <Text style={styles.emptySubText}>
        Vui lòng thử lại với các tiêu chí khác.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Lịch Trình Gợi Ý</Text>
        <TouchableOpacity onPress={handleSeedData}>
          <Text style={{ fontSize: 20 }}>➕</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        // <ActivityIndicator size="large" color="#667eea" style={{ marginTop: 50 }} />
        <LoadingScreen />
      ) : (
        <>
          {/* Region filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingHorizontal: 12, paddingVertical: 8 }}
          >
            {regions.map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => handleSelectRegion(r)}
                style={[
                  styles.regionButton,
                  selectedRegion === r && styles.regionButtonSelected,
                ]}
              >
                <Text
                  style={
                    selectedRegion === r
                      ? styles.regionTextSelected
                      : styles.regionText
                  }
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={templates}
            renderItem={renderTemplateItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={ListEmptyComponent}
          />
        </>
      )}

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
              <TouchableOpacity
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
                  handleOpenTripPicker(selectedTemplateDetail);
                }}
              >
                <Text style={styles.modalButtonText}>Áp dụng...</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </CustomModal>

      <CustomModal
        visible={showTripPicker}
        title="Chọn chuyến đi để import"
        onClose={() => setShowTripPicker(false)}
      >
        {loadingUserTrips ? (
          <ActivityIndicator size="large" color="#667eea" />
        ) : (
          <View style={{ maxHeight: 400 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {userTrips.length === 0 ? (
                <Text
                  style={{ textAlign: "center", color: "#666", padding: 20 }}
                >
                  Bạn chưa có chuyến đi nào. Hãy tạo chuyến mới trước khi
                  import.
                </Text>
              ) : (
                userTrips.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => handleApplyToExistingTrip(t)}
                    style={styles.tripPickerItem}
                    disabled={applyingToExisting}
                  >
                    <Text
                      style={{ fontSize: 16, fontWeight: "600", color: "#333" }}
                    >
                      {t.destination}
                    </Text>
                    {t.dates && (
                      <Text style={{ fontSize: 14, color: "#666" }}>
                        {t.dates}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            {applyingToExisting && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 15,
                }}
              >
                <ActivityIndicator size="small" color="#667eea" />
                <Text style={{ marginLeft: 10, color: "#666" }}>
                  Đang áp dụng...
                </Text>
              </View>
            )}
          </View>
        )}
      </CustomModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1A1A1A" },
  listContainer: { padding: 20 },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#333", flex: 1 },
  cardBudget: { fontSize: 14, color: "#27ae60", fontWeight: "600" },
  cardHighlights: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: { flexDirection: "row", justifyContent: "flex-end" },
  cardTripType: {
    fontSize: 12,
    color: "#667eea",
    fontWeight: "bold",
    textTransform: "uppercase",
    backgroundColor: "#eef0ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 24,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubText: { fontSize: 16, color: "#999" },
  tripPickerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
  regionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  regionButtonSelected: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  regionText: {
    color: "#333",
    fontWeight: "600",
  },
  regionTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
});

export default TemplateListScreen;
