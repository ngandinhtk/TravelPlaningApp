import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Heart,
  Search,
  Star,
} from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomModal from "../../components/common/Modal";

const DiscoverScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [savedDestinations, setSavedDestinations] = useState([]);

  const toggleSave = (id) => {
    if (savedDestinations.includes(id)) {
      setSavedDestinations(savedDestinations.filter((item) => item !== id));
    } else {
      setSavedDestinations([...savedDestinations, id]);
    }
  };

  const categories = ["All", "Nature", "City", "Food", "Adventure", "Culture"];

  // Mock Data
  const destinations = [
    {
      id: 1,
      name: "Kyoto, Japan",
      image:
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500&auto=format&fit=crop&q=60",
      rating: 4.8,
      category: "Culture",
      description: "Ancient temples and traditional tea houses.",
      price: "$1,200",
      bestTime: "Spring/Autumn",
      highlights: ["Kinkaku-ji", "Bamboo Forest", "Gion District"],
    },
    {
      id: 2,
      name: "Bali, Indonesia",
      image:
        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&auto=format&fit=crop&q=60",
      rating: 4.7,
      category: "Nature",
      description: "Tropical paradise with beaches and rice terraces.",
      price: "$800",
      bestTime: "April - October",
      highlights: ["Uluwatu Temple", "Nusa Penida", "Ubud Monkey Forest"],
    },
    {
      id: 3,
      name: "Paris, France",
      image:
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&auto=format&fit=crop&q=60",
      rating: 4.9,
      category: "City",
      description: "The city of lights, art, and romance.",
      price: "$1,500",
      bestTime: "June - August",
      highlights: ["Eiffel Tower", "Louvre Museum", "Montmartre"],
    },
    {
      id: 4,
      name: "Hanoi, Vietnam",
      image:
        "https://images.unsplash.com/photo-1555921015-5532091f6026?w=500&auto=format&fit=crop&q=60",
      rating: 4.6,
      category: "Food",
      description: "Street food paradise and rich history.",
      price: "$600",
      bestTime: "October - December",
      highlights: ["Old Quarter", "Ha Long Bay", "Train Street"],
    },
  ];

  const filteredDestinations =
    activeCategory === "All"
      ? destinations
      : destinations.filter((d) => d.category === activeCategory);

  const handleCardPress = (item) => {
    setSelectedDestination(item);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft color="#FFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Khám phá</Text>
          <TouchableOpacity
            onPress={() => router.push("/places/saved")}
            style={styles.savedButton}
          >
            <Heart color="#FFF" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search color="#666" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm điểm đến mơ ước..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </LinearGradient>

      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                activeCategory === cat && styles.activeCategoryChip,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat && styles.activeCategoryText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Điểm đến nổi bật</Text>
        <View style={styles.grid}>
          {filteredDestinations.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => handleCardPress(item)}
            >
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <TouchableOpacity
                style={styles.bookmarkButton}
                onPress={() => toggleSave(item.id)}
              >
                <Heart
                  size={20}
                  color={
                    savedDestinations.includes(item.id) ? "#ff4757" : "#FFF"
                  }
                  fill={
                    savedDestinations.includes(item.id)
                      ? "#ff4757"
                      : "transparent"
                  }
                />
              </TouchableOpacity>
              <View style={styles.cardOverlay} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Star fill="#FFD700" color="#FFD700" size={12} />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>
                <Text style={styles.cardDesc} numberOfLines={1}>
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Cộng đồng chia sẻ</Text>
        {/* Mock Community Trips */}
        <View style={styles.communityCard}>
          <View style={styles.communityHeader}>
            <Image
              source={{
                uri: "https://randomuser.me/api/portraits/women/44.jpg",
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.userName}>Sarah Chen</Text>
              <Text style={styles.tripTime}>2 giờ trước</Text>
            </View>
          </View>
          <Text style={styles.communityTripTitle}>
            Chuyến đi 5 ngày tại Đà Nẵng - Hội An
          </Text>
          <Text style={styles.communityTripDesc}>
            Lịch trình chi tiết ăn chơi, check-in những điểm hot nhất...
          </Text>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=500&auto=format&fit=crop&q=60",
            }}
            style={styles.communityImage}
          />
          <View style={styles.communityActions}>
            <Text style={styles.actionText}>❤️ 245</Text>
            <Text style={styles.actionText}>💬 42</Text>
            <Text style={styles.actionText}>✈️ Clone Trip</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <CustomModal
        visible={isModalVisible}
        title={selectedDestination?.name}
        onClose={() => setModalVisible(false)}
      >
        {selectedDestination && (
          <View>
            <Image
              source={{ uri: selectedDestination.image }}
              style={styles.modalImage}
            />
            <View style={styles.modalMeta}>
              <View style={styles.modalMetaItem}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={styles.modalMetaText}>
                  {selectedDestination.rating}
                </Text>
              </View>
              <View style={styles.modalMetaItem}>
                <DollarSign size={16} color="#667eea" />
                <Text style={styles.modalMetaText}>
                  {selectedDestination.price}
                </Text>
              </View>
              <View style={styles.modalMetaItem}>
                <Calendar size={16} color="#667eea" />
                <Text style={styles.modalMetaText}>
                  {selectedDestination.bestTime}
                </Text>
              </View>
            </View>
            <Text style={styles.modalDescription}>
              {selectedDestination.description}
            </Text>
            <Text style={styles.modalSectionTitle}>Điểm nổi bật:</Text>
            <View style={styles.highlightsContainer}>
              {selectedDestination.highlights.map((highlight, index) => (
                <View key={index} style={styles.highlightBadge}>
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#333" },
  categoryContainer: { marginVertical: 15 },
  categoryList: { paddingHorizontal: 20 },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  activeCategoryChip: { backgroundColor: "#667eea", borderColor: "#667eea" },
  categoryText: { color: "#666", fontWeight: "600" },
  activeCategoryText: { color: "#FFF" },
  content: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    marginTop: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    height: 200,
    borderRadius: 16,
    marginBottom: 15,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    position: "relative",
  },
  cardImage: { width: "100%", height: "100%" },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    flex: 1,
    marginRight: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 2,
  },
  cardDesc: { color: "rgba(255,255,255,0.9)", fontSize: 12 },
  communityCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  communityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  userName: { fontWeight: "bold", color: "#333" },
  tripTime: { fontSize: 12, color: "#999" },
  communityTripTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  communityTripDesc: { fontSize: 14, color: "#666", marginBottom: 10 },
  communityImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginBottom: 10,
  },
  communityActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  actionText: { color: "#666", fontWeight: "500" },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  modalMeta: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalMetaItem: { flexDirection: "row", alignItems: "center" },
  modalMetaText: { marginLeft: 5, fontWeight: "600", color: "#333" },
  modalDescription: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
    marginBottom: 15,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  highlightsContainer: { flexDirection: "row", flexWrap: "wrap" },
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
    fontWeight: "500",
  },
  bookmarkButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  savedButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
});

export default DiscoverScreen;
