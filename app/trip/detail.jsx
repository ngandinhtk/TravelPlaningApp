import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  CheckSquare,
  CloudSun,
  DollarSign,
  Download,
  Edit,
  FileText,
  Plane,
  Trash2,
  Users,
} from "lucide-react-native";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Loading from "../../components/common/Loading";
import CustomModal from "../../components/common/Modal";
import { useTrip } from "../../context/TripContext";
import { useUser } from "../../context/UserContext";
import {
  applyTemplateToTrip,
  deleteTrip,
  getTrip,
  getTripTemplates,
} from "../../services/tripService";

const TripDetailScreen = () => {
  const { trip, setTrip } = useTrip(); // Lấy toàn bộ đối tượng trip từ Context
  const router = useRouter();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState(null);
  const { user } = useUser();

  // Nếu trip chưa được tải xong (do context đang fetch), hiển thị loading
  // console.log('Trip in Detail Screen:', trip);
  if (!trip) {
    return <Loading />;
  }

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push("/trip/edit"); // Không cần truyền params nữa
  };

  const handleDelete = () => {
    setIsDeleteModalVisible(true);
  };

  const openTemplateModal = async () => {
    setIsTemplatesLoading(true);
    try {
      const fetched = await getTripTemplates();
      setTemplates(fetched);
      setIsTemplateModalVisible(true);
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setIsTemplatesLoading(false);
    }
  };

  const handleApplyTemplate = async (templateId) => {
    // console.log(templateId);

    if (!user) return;

    setIsApplying(true);
    setApplyError(null);
    try {
      // console.log(user.uid, trip.id, templateId);
      await applyTemplateToTrip(user.uid, trip.id, templateId);
      console.log("Template applied successfully");
      // Refresh trip in context
      const updated = await getTrip(trip.id);
      // console.log(updated)
      setTrip(updated);
      setIsTemplateModalVisible(false);
    } catch (error) {
      console.error("Failed to apply template:", error);
      setApplyError("Không thể áp template. Vui lòng thử lại.");
    } finally {
      setIsApplying(false);
    }
  };

  const confirmDelete = async () => {
    setIsDeleteModalVisible(false);
    try {
      await deleteTrip(trip.id);
      router.push("/home/home"); // Quay về trang chủ và làm mới
    } catch (error) {
      console.error("Lỗi khi xóa chuyến đi:", error);
    }
  };
  // console.log(templates);

  return (
    <View style={styles.itineraryContainer}>
      <CustomModal
        visible={isDeleteModalVisible}
        title="Xác nhận xóa"
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={confirmDelete}
      >
        <Text>
          Bạn có chắc chắn muốn xóa chuyến đi này không? Hành động này không thể
          hoàn tác.
        </Text>
      </CustomModal>

      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.itineraryHeader}
      >
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.itineraryTitle}>{trip.destination}</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* Trip Summary */}
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summarySection}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Dates</Text>
            <Text style={styles.summaryValue}>{trip.dates}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Destination</Text>
            <Text style={styles.summaryValue}>{trip.destination}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Budget</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <DollarSign size={16} color="#1A1A1A" />
                <Text style={[styles.summaryValue, { marginLeft: 6 }]}>
                  ${trip.budget}
                </Text>
              </View>
              <Text
                onPress={() => router.push("/budget/budget")}
                style={{ color: "blue", textDecorationLine: "none" }}
              >
                View{" "}
              </Text>
            </View>
          </View>

          {/* <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Packing List</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Backpack size={16} color="#1A1A1A" />
                <Text style={[styles.summaryValue, { marginLeft: 6 }]}>
                  {trip.packingList
                    ? trip.packingList.filter((i) => i.isChecked).length
                    : 0}
                  /{trip.packingList ? trip.packingList.length : 0} items
                </Text>
              </View>
              <Text
                onPress={() =>
                  router.push({
                    pathname: "/trip/packing",
                    params: { initialTab: "packing" },
                  })
                }
                style={{ color: "blue", textDecorationLine: "none" }}
              >
                Manage
              </Text>
            </View>
          </View> */}
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Packing List</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <CheckSquare size={16} color="#1A1A1A" />
                <Text style={[styles.summaryValue, { marginLeft: 6 }]}>
                  {trip.todoList
                    ? trip.todoList.filter((i) => i.isChecked).length
                    : 0}
                  /{trip.todoList ? trip.todoList.length : 0} tasks
                </Text>
              </View>
              <Text
                onPress={() =>
                  router.push({
                    pathname: "/trip/checklist",
                  })
                }
                style={{ color: "blue", textDecorationLine: "none" }}
              >
                Manage
              </Text>
            </View>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Travelers</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Users size={16} color="#1A1A1A" />
              <Text style={[styles.summaryValue, { marginLeft: 6 }]}>
                {trip.travelers}
              </Text>
            </View>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Calendar size={16} color="#1A1A1A" />
              <Text style={[styles.summaryValue, { marginLeft: 6 }]}>
                {trip.days} days
              </Text>
            </View>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Status</Text>
            <Text style={styles.summaryValue}>{trip.status}</Text>
          </View>
          <View style={[styles.summaryItem, { borderBottomWidth: 0 }]}>
            <Text style={styles.summaryLabel}>Note</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <FileText size={16} color="#1A1A1A" />
              <Text style={[styles.summaryValue, { marginLeft: 6 }]}>
                {trip.notes}
              </Text>
            </View>
          </View>
        </View>

        {/* Trip Details */}
        {/* <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Trip Details</Text>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Destination</Text>
            <Text style={styles.detailValue}>{trip.destination}</Text>
          </View>
        </View> */}

        {/* Quick Actions Grid */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity onPress={handleEdit} style={styles.actionItem}>
              <View style={[styles.iconCircle, { backgroundColor: "#eef0ff" }]}>
                <Edit color="#667eea" size={24} />
              </View>
              <Text style={styles.actionLabel}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/trip/transport")}
              style={styles.actionItem}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#eef0ff" }]}>
                <Plane color="#667eea" size={24} />
              </View>
              <Text style={styles.actionLabel}>Transport</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/trip/weather")}
              style={styles.actionItem}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#eef0ff" }]}>
                <CloudSun color="#667eea" size={24} />
              </View>
              <Text style={styles.actionLabel}>Weather</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/trip/invite")}
              style={styles.actionItem}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#eef0ff" }]}>
                <Users color="#667eea" size={24} />
              </View>
              <Text style={styles.actionLabel}>Invite</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={openTemplateModal}
              style={styles.actionItem}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#eef0ff" }]}>
                <Download color="#667eea" size={24} />
              </View>
              <Text style={styles.actionLabel}>Template</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDelete} style={styles.actionItem}>
              <View style={[styles.iconCircle, { backgroundColor: "#ffe5e5" }]}>
                <Trash2 color="#ff4757" size={24} />
              </View>
              <Text style={[styles.actionLabel, { color: "#ff4757" }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <CustomModal
        visible={isTemplateModalVisible}
        title="Chọn template để áp vào chuyến đi"
        onClose={() => setIsTemplateModalVisible(false)}
      >
        {isTemplatesLoading ? (
          <Text>Loading...</Text>
        ) : (
          <>
            {applyError && <Text style={{ color: "red" }}>{applyError}</Text>}
            {templates.length === 0 ? (
              <Text>Không có template nào</Text>
            ) : (
              templates.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => handleApplyTemplate(t.id)}
                  style={{ paddingVertical: 10 }}
                >
                  <Text style={{ fontSize: 16 }}>{t.name}</Text>
                </TouchableOpacity>
              ))
            )}
            {isApplying && <Text>Applying...</Text>}
          </>
        )}
      </CustomModal>
    </View>
  );
};

// Vui lòng thêm styles từ tệp gốc của bạn vào đây
const styles = StyleSheet.create({
  itineraryContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  center: {
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  itineraryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
  },
  backButtonTextWhite: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  itineraryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 20,
  },
  errorButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: "#667eea",
    borderRadius: 8,
  },
  errorButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  summarySection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  detailsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  actionsSection: {
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionItem: {
    width: "30%",
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
});

export default TripDetailScreen;
