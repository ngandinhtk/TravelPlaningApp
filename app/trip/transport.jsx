import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bus,
  Car,
  ExternalLink,
  Plane,
  Train,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTrip } from "../../context/TripContext";
import { getTransportOptions } from "../../services/transportService";

const TransportScreen = () => {
  const router = useRouter();
  const { trip } = useTrip();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (trip?.destination) {
      loadTransportOptions();
    }
  }, [trip]);

  const loadTransportOptions = async () => {
    setLoading(true);
    try {
      const data = await getTransportOptions(trip.destination);
      setOptions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't load page", err),
    );
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case "plane":
        return <Plane size={24} color="#667eea" />;
      case "train":
        return <Train size={24} color="#667eea" />;
      case "bus":
        return <Bus size={24} color="#667eea" />;
      case "car":
        return <Car size={24} color="#667eea" />;
      default:
        return <Plane size={24} color="#667eea" />;
    }
  };

  const renderItem = ({ item }) => (
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
        <View style={{ width: 24 }} />
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      ) : (
        <FlatList
          data={options}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
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
});

export default TransportScreen;
