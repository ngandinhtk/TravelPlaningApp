import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  Bus,
  Car,
  ExternalLink,
  Plane,
  Plus,
  Ticket,
  Trash2,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import CustomModal from "../../components/common/Modal";
import { useTrip } from "../../context/TripContext";
import { showToast } from "../../lib/showToast";
import { getTransportOptions } from "../../services/transportService";
import { updateTrip } from "../../services/tripService";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const TransportScreen = () => {
  const router = useRouter();
  const { trip, setTrip } = useTrip();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my_tickets"); // 'my_tickets' | 'suggestions'
  const [myTickets, setMyTickets] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Form State
  const [ticketType, setTicketType] = useState("plane");
  const [provider, setProvider] = useState("");
  const [code, setCode] = useState("");
  const [depTime, setDepTime] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (trip?.destination) {
      loadTransportOptions();
    }
    if (trip?.transportation) {
      setMyTickets(trip.transportation);
    }
  }, [trip]);

  const loadTransportOptions = async () => {
    // Chỉ loading nếu đang ở tab suggestions và chưa có data
    if (options.length === 0) setLoading(true);
    try {
      const data = await getTransportOptions(trip.destination);
      setOptions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } =
          await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") {
          Alert.alert(
            "Quyền thông báo",
            "Vui lòng cấp quyền thông báo để sử dụng tính năng này.",
          );
          return;
        }
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Kiểm tra thông báo 🔔",
          body: "Hệ thống thông báo hoạt động bình thường!",
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.log("Error sending test notification:", error);
    }
  };

  const handleAddTicket = async () => {
    if (!provider || !depTime) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập hãng vận chuyển và giờ đi.",
      );
      return;
    }

    let notificationId = null;

    // Schedule Notification
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (
        status === "granted" ||
        (await Notifications.requestPermissionsAsync()).status === "granted"
      ) {
        // Parse time string (e.g., "08:30")
        const [hours, minutes] = depTime.split(":").map(Number);
        const triggerDate = new Date(selectedDate);
        if (!isNaN(hours) && !isNaN(minutes)) {
          triggerDate.setHours(hours, minutes, 0, 0);

          // Only schedule if time is in the future
          if (triggerDate > new Date()) {
            notificationId = await Notifications.scheduleNotificationAsync({
              content: {
                title: "Sắp đến giờ khởi hành! ✈️",
                body: `Chuyến đi ${provider} (${code || "Vé"}) của bạn sẽ khởi hành lúc ${depTime}.`,
                sound: true,
              },
              trigger: triggerDate,
            });
          }
        }
      }
    } catch (error) {
      console.log("Error scheduling notification:", error);
    }

    const newTicket = {
      id: Date.now().toString(),
      type: ticketType,
      provider,
      code,
      depDate: selectedDate.toISOString(),
      depTime,
      price: price || "0",
      notificationId,
    };

    const updatedTickets = [...myTickets, newTicket];
    setMyTickets(updatedTickets);
    setTrip({ ...trip, transportation: updatedTickets });
    setIsModalVisible(false);
    resetForm();

    try {
      await updateTrip(trip.id, { transportation: updatedTickets });
      showToast("Đã thêm vé thành công!");
    } catch (error) {
      console.error("Error saving ticket:", error);
      Alert.alert("Lỗi", "Không thể lưu vé. Vui lòng thử lại.");
    }
  };

  const handleDeleteTicket = (id) => {
    Alert.alert("Xóa vé", "Bạn có chắc muốn xóa vé này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          const ticketToDelete = myTickets.find((t) => t.id === id);
          if (ticketToDelete?.notificationId) {
            await Notifications.cancelScheduledNotificationAsync(
              ticketToDelete.notificationId,
            );
          }

          const updatedTickets = myTickets.filter((t) => t.id !== id);
          setMyTickets(updatedTickets);
          setTrip({ ...trip, transportation: updatedTickets });
          try {
            await updateTrip(trip.id, { transportation: updatedTickets });
          } catch (error) {
            console.error("Error deleting ticket:", error);
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setProvider("");
    setCode("");
    setDepTime("");
    setPrice("");
    setTicketType("plane");
    setSelectedDate(new Date());
  };

  const handleBooking = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't load page", err),
    );
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const handleConfirmDate = (date) => {
    setSelectedDate(date);
    setDatePickerVisibility(false);
  };
  const getIcon = (iconName, size = 24, color = "#667eea") => {
    switch (iconName) {
      case "plane":
        return <Plane size={size} color={color} />;
      case "bus":
        return <Bus size={size} color={color} />;
      case "car":
        return <Car size={size} color={color} />;
      default:
        return <Ticket size={size} color={color} />;
    }
  };

  const renderSuggestionItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>{getIcon(item.icon)}</View>
        <View style={styles.headerText}>
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>⏱️ Thời gian di chuyển:</Text>
            <Text style={styles.detailValue}>{item.duration}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>💰 Chi phí ước tính:</Text>
            <Text style={styles.detailValue}>{item.priceRange}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => handleBooking(item.bookingUrl)}
      >
        <Text style={styles.bookButtonText}>Đặt vé ngay</Text>
        <ExternalLink size={16} color="#FFF" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </View>
  );

  const renderMyTicketItem = ({ item }) => (
    <View style={styles.ticketCard}>
      <View style={styles.ticketLeft}>
        <View style={styles.ticketIconBg}>
          {getIcon(item.type, 20, "#FFF")}
        </View>
        <View style={styles.dashedLine} />
      </View>
      <View style={styles.ticketRight}>
        <View style={styles.ticketHeader}>
          <Text style={styles.providerText}>{item.provider}</Text>
          <TouchableOpacity onPress={() => handleDeleteTicket(item.id)}>
            <Trash2 size={18} color="#ff6b6b" />
          </TouchableOpacity>
        </View>

        <View style={styles.ticketRow}>
          <View style={styles.ticketInfoItem}>
            <Text style={styles.ticketLabel}>Mã vé/Chuyến</Text>
            <Text style={styles.ticketValue}>{item.code || "---"}</Text>
          </View>
          <View style={styles.ticketInfoItem}>
            <Text style={styles.ticketLabel}>Giờ khởi hành</Text>
            <Text style={styles.ticketValue}>{item.depTime}</Text>
          </View>
          {item.depDate && (
            <View style={styles.ticketInfoItem}>
              <Text style={styles.ticketLabel}>Ngày</Text>
              <Text style={styles.ticketValue}>{formatDate(item.depDate)}</Text>
            </View>
          )}
        </View>

        {item.price ? (
          <View style={styles.ticketPriceRow}>
            <Text style={styles.ticketLabel}>Giá vé:</Text>
            <Text style={styles.ticketPrice}>
              {parseInt(item.price).toLocaleString("vi-VN")}đ
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  if (!trip)
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Thông tin đi lại</Text>
          <Text style={styles.headerSubtitle}>Đến {trip.destination}</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={handleTestNotification}
            style={[styles.addButton, { marginRight: 10 }]}
          >
            <Bell color="#667eea" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsModalVisible(true)}
            style={styles.addButton}
          >
            <Plus color="#667eea" size={24} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "my_tickets" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("my_tickets")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "my_tickets" && styles.activeTabText,
            ]}
          >
            Vé của tôi
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "suggestions" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("suggestions")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "suggestions" && styles.activeTabText,
            ]}
          >
            Gợi ý di chuyển
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "my_tickets" ? (
        <FlatList
          data={myTickets}
          renderItem={renderMyTicketItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎫</Text>
              <Text style={styles.emptyText}>Chưa có vé nào</Text>
              <Text style={styles.emptySub}>
                Thêm vé máy bay, tàu xe để quản lý chuyến đi
              </Text>
            </View>
          }
        />
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      ) : (
        <FlatList
          data={options}
          renderItem={renderSuggestionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <CustomModal
        visible={isModalVisible}
        title="Thêm vé mới"
        onClose={() => setIsModalVisible(false)}
        onConfirm={handleAddTicket}
        confirmText="Lưu vé"
      >
        <View style={styles.typeSelector}>
          {["plane", "train", "bus", "car"].map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeOption,
                ticketType === t && styles.typeOptionSelected,
              ]}
              onPress={() => setTicketType(t)}
            >
              {getIcon(t, 20, ticketType === t ? "#FFF" : "#666")}
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Hãng vận chuyển (VD: Vietnam Airlines)"
          value={provider}
          onChangeText={setProvider}
        />

        <TouchableOpacity
          style={styles.input}
          onPress={() => setDatePickerVisibility(true)}
        >
          <Text style={{ color: "#333" }}>
            Ngày đi: {formatDate(selectedDate)}
          </Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 10 }]}
            placeholder="Mã vé/Chuyến (VD: VN123)"
            value={code}
            onChangeText={setCode}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Giờ đi (VD: 08:30)"
            value={depTime}
            onChangeText={setDepTime}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Giá vé (VNĐ)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={() => setDatePickerVisibility(false)}
          date={selectedDate}
          locale="vi_VN"
        />
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 4,
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: "#FFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 5,
    margin: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#eef0ff",
  },
  tabText: {
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#667eea",
    fontWeight: "bold",
  },
  listContent: { padding: 20 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F2F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerText: { flex: 1 },
  typeText: { fontSize: 18, fontWeight: "bold", color: "#333" },
  durationText: { fontSize: 14, color: "#666", marginTop: 2 },
  cardBody: { marginBottom: 16 },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
    lineHeight: 20,
  },
  priceContainer: { backgroundColor: "#F9FAFB", padding: 10, borderRadius: 8 },
  priceLabel: { fontSize: 12, color: "#888", marginBottom: 2 },
  priceValue: { fontSize: 16, fontWeight: "600", color: "#2ecc71" },
  bookButton: {
    flexDirection: "row",
    backgroundColor: "#667eea",
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  bookButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },

  // My Ticket Styles
  ticketCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  ticketLeft: {
    width: 60,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  ticketIconBg: {
    zIndex: 2,
  },
  dashedLine: {
    position: "absolute",
    right: 0,
    top: 10,
    bottom: 10,
    width: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderStyle: "dashed",
  },
  ticketRight: {
    flex: 1,
    padding: 15,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  providerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  ticketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  ticketInfoItem: {
    flex: 1,
  },
  ticketLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  ticketValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  ticketPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  ticketPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2ecc71",
    marginLeft: 6,
  },
  emptyState: { alignItems: "center", marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#333" },
  emptySub: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 40,
  },

  // Modal Styles
  typeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  typeOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F2F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  typeOptionSelected: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  input: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  row: {
    flexDirection: "row",
  },
});

export default TransportScreen;
