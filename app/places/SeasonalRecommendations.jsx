import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getSeasonalPlaces } from "../../services/placeService";

const MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const SeasonalRecommendations = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState([]);
  // Default to current month (1-12)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    loadPlaces();
  }, [currentMonth]);

  const loadPlaces = async () => {
    setLoading(true);
    try {
      const data = await getSeasonalPlaces(currentMonth);
      setPlaces(data);
    } catch (error) {
      console.error("Error loading seasonal places:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/places/${item.id}`)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.gradient}
      >
        <View style={styles.textContainer}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.location}>📍 {item.province}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gợi ý {MONTHS[currentMonth - 1]} 🌤️</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="small"
          color="#667eea"
          style={{ margin: 20 }}
        />
      ) : places.length > 0 ? (
        <FlatList
          data={places}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <Text style={styles.emptyText}>Không có gợi ý nào cho tháng này.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  listContent: {
    paddingHorizontal: 12,
  },
  card: {
    width: 200,
    height: 250,
    borderRadius: 12,
    marginHorizontal: 4,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    justifyContent: "flex-end",
    padding: 12,
  },
  textContainer: {
    justifyContent: "flex-end",
  },
  category: {
    color: "#4ecdc4",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  location: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
  },
  emptyText: {
    paddingHorizontal: 16,
    color: "#999",
    fontStyle: "italic",
  },
});

export default SeasonalRecommendations;
