import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// import BackButton from "../../components/common/BackButton";
import { LinearGradient } from "expo-linear-gradient";
import LoadingScreen from "../../components/common/Loading";
import CustomModal from "../../components/common/Modal";
import { useTrip } from "../../context/TripContext";
import { useUser } from "../../context/UserContext";
import { db } from "../../services/firebase";
import {
  applyTemplateToTrip,
  getTrips,
  getTripTemplates,
  updateTrip,
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
      {
        day: 4,
        title: "Tạm biệt Đà Lạt",
        activities: [
          "Ăn sáng bánh mì xíu mại",
          "Mua quà lưu niệm",
          "Ra sân bay",
        ],
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
      {
        day: 3,
        title: "Tạm biệt",
        activities: ["Mua quà đặc sản", "Ra sân bay"],
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
  const [allTemplates, setAllTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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
        let data = [];
        if (fetchedTemplates.length > 0) {
          data = fetchedTemplates;
        } else {
          // If no templates in DB, show sample ones. Mark them as samples.
          data = SAMPLE_TEMPLATES.map((t, i) => ({
            ...t,
            id: `sample-${i}`,
            isSample: true,
          }));
        }

        setAllTemplates(data);
        setTemplates(data);

        // derive available regions/destinations from templates
        const locationSet = new Set(
          data.map((t) => t.destination || t.region).filter((r) => !!r),
        );
        setRegions(["All", ...Array.from(locationSet)]);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
        alert("Đã có lỗi xảy ra khi tải lịch trình mẫu.");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Effect để lọc dữ liệu khi search hoặc chọn region thay đổi
  useEffect(() => {
    let result = allTemplates;

    // 1. Lọc theo Region
    if (selectedRegion && selectedRegion !== "All") {
      result = result.filter(
        (t) => t.destination === selectedRegion || t.region === selectedRegion,
      );
    }

    // 2. Lọc theo Search Query (Tên hoặc Highlights)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          (t.highlights &&
            t.highlights.some((h) => h.toLowerCase().includes(query))),
      );
    }

    setTemplates(result);
  }, [searchQuery, selectedRegion, allTemplates]);

  // const handleSeedData = async () => {
  //   setLoading(true);
  //   try {
  //     const result = await seedTemplates();
  //     Alert.alert(result.success ? "Thành công" : "Thông báo", result.message);
  //     if (result.success) {
  //       const fetched = await getTripTemplates(50);
  //       setAllTemplates(fetched);
  //       setTemplates(fetched);
  //       const locationSet = new Set(
  //         fetched.map((t) => t.destination || t.region).filter((r) => !!r),
  //       );
  //       setRegions(["All", ...Array.from(locationSet)]);
  //     }
  //   } catch (error) {
  //     Alert.alert("Lỗi", "Không thể thêm dữ liệu mẫu.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
    // Logic lọc đã được chuyển vào useEffect
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplateDetail(template);
    setShowDetailModal(true);
  };

  const handleTemplateAction = async (template) => {
    if (!user) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để sử dụng tính năng này.",
      );
      return;
    }

    setLoading(true);
    try {
      const trips = await getTrips(user.uid);
      const hasMatchingTrip = trips.some(
        (t) =>
          t.destination &&
          template.destination &&
          t.destination
            .toLowerCase()
            .includes(template.destination.toLowerCase()),
      );

      if (hasMatchingTrip) {
        setSelectedTemplateForExisting(template);
        setUserTrips(trips);
        setShowTripPicker(true);
      } else {
        await handleCreateTripFromTemplate(template);
      }
    } catch (error) {
      console.error("Error in template action:", error);
      Alert.alert("Lỗi", "Không thể xử lý yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTripFromTemplate = async (template) => {
    setLoading(true);
    try {
      // Helper to format date for default
      const today = new Date();
      const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };
      const defaultDates = `${formatDate(today)} - ${formatDate(today)}`;

      // 1. Tạo object chuyến đi mới
      const newTripData = {
        userId: user.uid,
        destination: template.destination,
        dates: defaultDates,
        duration: template.duration,
        travelers: 1,
        budget: 0,
        createdAt: serverTimestamp(),
        status: "planning",
        // Nếu là sample data, nạp trực tiếp dữ liệu vào
        itinerary: template.isSample ? template.itinerary : [],
        packingList: template.isSample ? template.packingList : [],
      };

      const docRef = await addDoc(collection(db, "trips"), newTripData);
      const newTripId = docRef.id;

      // 2. Nếu là template server, gọi hàm apply để fetch chi tiết
      if (!template.isSample) {
        await applyTemplateToTrip(user.uid, newTripId, template.id);
      }

      // 3. Chuyển hướng
      setSelectedTripId(newTripId);
      showToast("Đã tạo chuyến đi mới từ mẫu!");
      router.push("/trip/detail");
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể tạo chuyến đi.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToExistingTrip = async (trip) => {
    if (!selectedTemplateForExisting || applyingToExisting) return;

    // Kiểm tra địa điểm trùng khớp
    if (
      selectedTemplateForExisting.destination &&
      (!trip.destination ||
        !trip.destination
          .toLowerCase()
          .includes(selectedTemplateForExisting.destination.toLowerCase()))
    ) {
      Alert.alert("Lỗi", "Địa điểm của template không khớp với chuyến đi này.");
      return;
    }

    // Xác nhận từ user trước khi apply
    Alert.alert(
      "Áp dụng lịch trình",
      `Bạn sẽ áp dụng lịch trình "${selectedTemplateForExisting.name}" vào chuyến đi "${trip.destination}"?\n\nChỉ itinerary và packing list sẽ được cập nhật. Các thông tin gốc như ngày đi, ngân sách sẽ không thay đổi.`,
      [
        {
          text: "Hủy",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Áp dụng",
          onPress: async () => {
            setApplyingToExisting(true);
            try {
              if (selectedTemplateForExisting.isSample) {
                // Xử lý sample data: chỉ merge itinerary và packing list
                await updateTrip(trip.id, {
                  itinerary: selectedTemplateForExisting.itinerary,
                  packingList: selectedTemplateForExisting.packingList,
                });
              } else {
                // Áp dụng template: merge itinerary và packing list mà bảo vệ thông tin gốc
                await applyTemplateToTrip(
                  user.uid,
                  trip.id,
                  selectedTemplateForExisting.id,
                  true, // mergeOnly = true để chỉ merge itinerary
                );
              }
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
          },
        },
      ],
    );
  };

  const renderRegionItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.regionChip,
        selectedRegion === item && styles.regionChipActive,
      ]}
      onPress={() => handleSelectRegion(item)}
    >
      <Text
        style={[
          styles.regionText,
          selectedRegion === item && styles.regionTextActive,
        ]}
      >
        {item === "All" ? "Tất cả" : item}
      </Text>
    </TouchableOpacity>
  );

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
            onPress={() => handleTemplateAction(item)}
            style={{ marginLeft: 12 }}
            disabled={!!importingStatus[item.id]}
          >
            <Text
              style={{
                color: "#27ae60",
                fontWeight: "600",
              }}
            >
              Sử dụng mẫu
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
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>&larr; Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch Trình Gợi Ý</Text>
        <View style={{ width: 50 }} />
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm lịch trình, điểm đến..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {loading ? (
        // <ActivityIndicator size="large" color="#667eea" style={{ marginTop: 50 }} />
        <LoadingScreen />
      ) : (
        <>
          {/* Region filter */}
          <View style={styles.filterContainer}>
            <FlatList
              data={regions}
              renderItem={renderRegionItem}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.regionList}
            />
          </View>

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
                style={[styles.modalButton, styles.applyButton]}
                // disabled={selectedTemplateDetail?.isSample}
                onPress={() => {
                  setShowDetailModal(false);
                  handleTemplateAction(selectedTemplateDetail);
                }}
              >
                <Text style={styles.modalButtonText}>Sử dụng mẫu</Text>
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
                userTrips.map((t) => {
                  const isMatch = selectedTemplateForExisting?.destination
                    ? t.destination
                        ?.toLowerCase()
                        .includes(
                          selectedTemplateForExisting.destination.toLowerCase(),
                        )
                    : true;

                  return (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => handleApplyToExistingTrip(t)}
                      style={[
                        styles.tripPickerItem,
                        !isMatch && { opacity: 0.6 },
                      ]}
                      disabled={applyingToExisting || !isMatch}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#333",
                        }}
                      >
                        {t.destination}
                      </Text>
                      {t.dates && (
                        <Text style={{ fontSize: 14, color: "#666" }}>
                          {t.dates}
                        </Text>
                      )}
                      {!isMatch && (
                        <Text style={{ fontSize: 12, color: "red" }}>
                          Không khớp địa điểm (
                          {selectedTemplateForExisting?.destination})
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })
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
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF" },
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
  // header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40 },
  // headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  backButton: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
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
  searchContainer: {
    padding: 15,
    backgroundColor: "#fff",
  },
  searchInput: {
    backgroundColor: "#F0F2F5",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  filterContainer: {
    backgroundColor: "#fff",
    paddingVertical: 10,
  },
  regionList: {
    paddingHorizontal: 15,
  },
  regionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  regionChipActive: {
    backgroundColor: "#E0E7FF",
    borderColor: "#667eea",
  },
  regionText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  regionTextActive: {
    color: "#667eea",
    fontWeight: "700",
  },
});

export default TemplateListScreen;
