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
  MapPin,
  Plane,
  Plus,
  Trash2,
  Users,
} from "lucide-react-native";
import { useState } from "react";
import {
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
import { useUser } from "../../context/UserContext";
import { showToast } from "../../lib/showToast";
import {
  applyTemplateToTrip,
  deleteTrip,
  getTrip,
  getTripTemplates,
  updateTrip,
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
  const [previousTripState, setPreviousTripState] = useState(null);

  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [activityForm, setActivityForm] = useState({
    time: "",
    title: "",
    location: "",
    description: "",
  });

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
      // Lưu trạng thái trước khi apply để có thể hoàn tác
      setPreviousTripState({
        itinerary: trip.itinerary || [],
        packingList: trip.packingList || [],
        todoList: trip.todoList || [],
      });
      // console.log(user.uid, trip.id, templateId);
      await applyTemplateToTrip(user.uid, trip.id, templateId);
      console.log("Template applied successfully");
      // Refresh trip in context
      const updated = await getTrip(trip.id);
      // console.log(updated)
      setTrip(updated);
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
    if (!previousTripState) return;
    setIsApplying(true);
    try {
      await updateTrip(trip.id, previousTripState);
      // Cập nhật lại state local
      setTrip({ ...trip, ...previousTripState });
      setPreviousTripState(null);
      showToast("Đã hoàn tác thay đổi!");
    } catch (error) {
      console.error("Failed to undo:", error);
      setApplyError("Không thể hoàn tác. Vui lòng thử lại.");
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

  const handleAddActivity = (dayIndex) => {
    setSelectedDayIndex(dayIndex);
    setEditingActivity(null);
    setActivityForm({ time: "", title: "", location: "", description: "" });
    setActivityModalVisible(true);
  };

  const handleEditActivity = (dayIndex, activityIndex, activity) => {
    setSelectedDayIndex(dayIndex);
    setEditingActivity({ dayIndex, activityIndex });
    setActivityForm({
      time: activity.time || "",
      title: typeof activity === "string" ? activity : activity.title || "",
      location: activity.location || "",
      description: activity.description || "",
    });
    setActivityModalVisible(true);
  };

  const handleSaveActivity = async () => {
    if (!activityForm.title.trim()) return;

    const newItinerary = [...(trip.itinerary || [])];
    const day = { ...newItinerary[selectedDayIndex] };
    const activities = [...(day.activities || [])];

    const newActivityData = {
      ...activityForm,
    };

    if (editingActivity) {
      activities[editingActivity.activityIndex] = newActivityData;
    } else {
      activities.push(newActivityData);
    }

    day.activities = activities;
    newItinerary[selectedDayIndex] = day;

    // Optimistic update
    setTrip({ ...trip, itinerary: newItinerary });
    setActivityModalVisible(false);

    // Save to Firebase
    await updateTrip(trip.id, { itinerary: newItinerary });
  };

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

        {/* Itinerary Section - Lịch trình chi tiết */}
        <View style={styles.itinerarySection}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
              Lịch trình chi tiết
            </Text>
            {previousTripState && (
              <TouchableOpacity onPress={handleUndoApply} disabled={isApplying}>
                <Text style={{ color: "#667eea", fontWeight: "600" }}>
                  ↩ Hoàn tác
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {trip.itinerary && trip.itinerary.length > 0 ? (
            trip.itinerary.map((dayItem, index) => (
              <View key={index} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>Ngày {dayItem.day}</Text>
                  </View>
                  <Text style={styles.dayTitleText}>
                    {dayItem.title || `Ngày ${dayItem.day}`}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleAddActivity(index)}
                    style={styles.addActivityBtn}
                  >
                    <Plus size={20} color="#667eea" />
                  </TouchableOpacity>
                </View>

                <View style={styles.activitiesList}>
                  {dayItem.activities &&
                    dayItem.activities.map((activity, actIndex) => (
                      <TouchableOpacity
                        key={actIndex}
                        style={styles.activityRow}
                        onPress={() =>
                          handleEditActivity(index, actIndex, activity)
                        }
                      >
                        <View style={styles.timelineContainer}>
                          <View style={styles.timelineLine} />
                          <View style={styles.activityDot} />
                        </View>
                        <View style={styles.leftColumn}>
                          <Text style={styles.timeTextLeft}>
                            {typeof activity === "object" ? activity.time : ""}
                          </Text>
                        </View>

                        <View style={styles.activityContent}>
                          {typeof activity === "object" ? (
                            <>
                              <View style={styles.activityHeader}>
                                <Text style={styles.activityTitle}>
                                  {activity.title || activity.text}
                                </Text>
                              </View>
                              {activity.description && (
                                <Text style={styles.activityDesc}>
                                  {activity.description}
                                </Text>
                              )}
                              {activity.location && (
                                <View style={styles.locationRow}>
                                  <MapPin size={12} color="#999" />
                                  <Text style={styles.locationText}>
                                    {activity.location}
                                  </Text>
                                </View>
                              )}
                            </>
                          ) : (
                            <Text style={styles.activityText}>{activity}</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyItinerary}>
              <Text style={styles.emptyItineraryText}>
                Chưa có lịch trình nào.
              </Text>
              <Text style={styles.emptyItinerarySubText}>
                Hãy áp dụng template hoặc tự tạo lịch trình mới.
              </Text>
              <TouchableOpacity
                style={styles.createItineraryButton}
                onPress={openTemplateModal}
              >
                <Text style={styles.createItineraryText}>
                  + Thêm lịch trình mẫu
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

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

      {/* Modal Thêm/Sửa Hoạt Động */}
      <CustomModal
        visible={activityModalVisible}
        title={editingActivity ? "Chỉnh sửa hoạt động" : "Thêm hoạt động mới"}
        onClose={() => setActivityModalVisible(false)}
        onConfirm={handleSaveActivity}
        confirmText="Lưu"
      >
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>
            Tên hoạt động <Text style={{ color: "red" }}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={activityForm.title}
            onChangeText={(t) => setActivityForm({ ...activityForm, title: t })}
            placeholder="Ví dụ: Ăn tối, Check-in..."
          />

          <Text style={styles.inputLabel}>Thời gian</Text>
          <TextInput
            style={styles.input}
            value={activityForm.time}
            onChangeText={(t) => setActivityForm({ ...activityForm, time: t })}
            placeholder="Ví dụ: 08:00 - 10:00"
          />

          <Text style={styles.inputLabel}>Địa điểm</Text>
          <TextInput
            style={styles.input}
            value={activityForm.location}
            onChangeText={(t) =>
              setActivityForm({ ...activityForm, location: t })
            }
            placeholder="Tên địa điểm, địa chỉ..."
          />

          <Text style={styles.inputLabel}>Mô tả / Ghi chú</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            value={activityForm.description}
            onChangeText={(t) =>
              setActivityForm({ ...activityForm, description: t })
            }
            multiline
            placeholder="Chi tiết hoạt động..."
          />
        </View>
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
  itinerarySection: {
    marginBottom: 24,
  },
  dayCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 12,
  },
  dayBadge: {
    backgroundColor: "#eef0ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  dayBadgeText: {
    color: "#667eea",
    fontWeight: "bold",
    fontSize: 12,
  },
  dayTitleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  addActivityBtn: {
    padding: 4,
  },
  activitiesList: {
    paddingLeft: 8,
  },
  activityRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  leftColumn: {
    width: 45,
    alignItems: "flex-end",
    paddingRight: 8,
    paddingTop: 12,
  },
  timeTextLeft: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#667eea",
    textAlign: "right",
  },
  timelineContainer: {
    width: 20,
    alignItems: "center",
  },
  timelineLine: {
    position: "absolute",
    top: 0,
    bottom: -16,
    width: 2,
    backgroundColor: "#f0f0f0",
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#667eea",
    marginTop: 14,
    zIndex: 2,
    borderWidth: 2,
    borderColor: "#fff",
  },
  activityContent: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 12,
    marginLeft: 4,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef0ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: "#667eea",
    fontWeight: "600",
    marginLeft: 4,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  activityDesc: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
  },
  emptyItinerary: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  emptyItineraryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  emptyItinerarySubText: {
    fontSize: 14,
    color: "#999",
    marginBottom: 16,
  },
  createItineraryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#eef0ff",
    borderRadius: 20,
  },
  createItineraryText: {
    color: "#667eea",
    fontWeight: "600",
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
  formContainer: {
    paddingVertical: 10,
  },
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
});

export default TripDetailScreen;
