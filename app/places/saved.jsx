import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Star, Trash2 } from "lucide-react-native";
import { useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const SavedPlacesScreen = () => {
  const router = useRouter();
  // Mock data - In a real app, retrieve this from Context/API based on saved IDs
  const [savedPlaces, setSavedPlaces] = useState([
    {
      id: 1,
      name: "Kyoto, Japan",
      image:
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500&auto=format&fit=crop&q=60",
      rating: 4.8,
      category: "Culture",
      description: "Ancient temples and traditional tea houses.",
    },
    {
      id: 3,
      name: "Paris, France",
      image:
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&auto=format&fit=crop&q=60",
      rating: 4.9,
      category: "City",
      description: "The city of lights, art, and romance.",
    },
  ]);

  const handleRemove = (id) => {
    setSavedPlaces((prev) => prev.filter((item) => item.id !== id));
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        // Navigate to detail if needed
      }}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemove(item.id)}
      >
        <Trash2 size={20} color="#ff4757" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Địa điểm đã lưu</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <FlatList
        data={savedPlaces}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Chưa có địa điểm nào được lưu.</Text>
          </View>
        }
      />
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
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
  listContent: { padding: 20 },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 120,
  },
  cardImage: { width: 120, height: "100%" },
  cardContent: { flex: 1, padding: 12, justifyContent: "center" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#333", flex: 1 },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 4,
  },
  cardCategory: {
    fontSize: 12,
    color: "#667eea",
    fontWeight: "600",
    marginBottom: 4,
  },
  cardDesc: { fontSize: 12, color: "#666" },
  removeButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    padding: 8,
  },
  emptyState: { alignItems: "center", marginTop: 50 },
  emptyText: { fontSize: 16, color: "#999" },
});

export default SavedPlacesScreen;
