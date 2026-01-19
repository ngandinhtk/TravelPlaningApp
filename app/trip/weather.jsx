import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  Sun,
  Wind,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTrip } from "../../context/TripContext";
import { getWeatherForecast } from "../../services/weatherService";

const WeatherScreen = () => {
  const router = useRouter();
  const { trip } = useTrip();
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (trip?.destination) {
      loadWeather();
    }
  }, [trip]);

  const loadWeather = async () => {
    setLoading(true);
    try {
      const data = await getWeatherForecast(trip.destination);
      setForecast(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition, size = 24, color = "#333") => {
    switch (condition) {
      case "Sunny":
        return <Sun size={size} color="#FDB813" />;
      case "Cloudy":
        return <Cloud size={size} color="#95a5a6" />;
      case "Rainy":
        return <CloudRain size={size} color="#3498db" />;
      case "Partly Cloudy":
        return <CloudSun size={size} color="#f1c40f" />;
      case "Stormy":
        return <CloudLightning size={size} color="#8e44ad" />;
      default:
        return <Sun size={size} color="#FDB813" />;
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={[styles.card, index === 0 && styles.todayCard]}>
      <View style={styles.dateContainer}>
        <Text style={[styles.dateText, index === 0 && styles.todayText]}>
          {index === 0 ? "Hôm nay" : item.date}
        </Text>
        <Text style={styles.conditionText}>{item.condition}</Text>
      </View>

      <View style={styles.iconContainer}>
        {getWeatherIcon(item.condition, index === 0 ? 48 : 32)}
      </View>

      <View style={styles.tempContainer}>
        <Text style={styles.tempMax}>{item.tempMax}°</Text>
        <Text style={styles.tempMin}>{item.tempMin}°</Text>
      </View>

      {index === 0 && (
        <View style={styles.detailContainer}>
          <View style={styles.detailItem}>
            <Droplets size={16} color="#3498db" />
            <Text style={styles.detailText}>{item.humidity}%</Text>
          </View>
          <View style={styles.detailItem}>
            <Wind size={16} color="#95a5a6" />
            <Text style={styles.detailText}>{item.windSpeed} km/h</Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Dự báo thời tiết</Text>
          <Text style={styles.headerSubtitle}>{trip?.destination}</Text>
        </View>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4facfe" />
        </View>
      ) : (
        <FlatList
          data={forecast}
          renderItem={renderItem}
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F8" },
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
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: 4,
  },
  listContent: { padding: 20 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  todayCard: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#fff",
  },
  dateContainer: { flex: 1 },
  dateText: { fontSize: 16, fontWeight: "600", color: "#333" },
  todayText: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  conditionText: { fontSize: 14, color: "#666" },
  iconContainer: { marginHorizontal: 16 },
  tempContainer: { alignItems: "flex-end" },
  tempMax: { fontSize: 18, fontWeight: "bold", color: "#333" },
  tempMin: { fontSize: 14, color: "#999" },
  detailContainer: {
    flexDirection: "row",
    marginTop: 20,
    width: "100%",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
  },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailText: { color: "#555", fontWeight: "500" },
});

export default WeatherScreen;
