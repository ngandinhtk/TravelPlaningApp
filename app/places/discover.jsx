import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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

const DiscoverScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const categories = [
    "Tất cả",
    "Thịnh hành",
    "Mùa này đi đâu",
    "Giá rẻ",
    "Hidden Gems",
  ];

  // Mock data for trending destinations
  const trendingDestinations = [
    {
      id: 1,
      name: "Hội An",
      image:
        "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2000&auto=format&fit=crop",
      rating: 4.8,
      reviews: 1234,
    },
    {
      id: 2,
      name: "Hạ Long",
      image:
        "https://images.unsplash.com/photo-1528127220108-5362b6b6864d?q=80&w=2000&auto=format&fit=crop",
      rating: 4.7,
      reviews: 890,
    },
    {
      id: 3,
      name: "Sapa",
      image:
        "https://images.unsplash.com/photo-1565355858-6225c5695020?q=80&w=2000&auto=format&fit=crop",
      rating: 4.6,
      reviews: 750,
    },
    {
      id: 4,
      name: "Đà Lạt",
      image:
        "https://images.unsplash.com/photo-1625409678382-74b452771503?q=80&w=2000&auto=format&fit=crop",
      rating: 4.9,
      reviews: 2100,
    },
  ];

  // Mock data for community trips
  const communityTrips = [
    {
      id: 1,
      title: "Đà Lạt 3N2Đ - Săn Mây & Cafe",
      author: "Minh Anh",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      likes: 245,
      days: 3,
      budget: "3.5tr",
      image:
        "https://images.unsplash.com/photo-1544885935-98dd03b09034?q=80&w=2000&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Food Tour Hải Phòng 24h",
      author: "Tuấn Hưng",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      likes: 189,
      days: 1,
      budget: "1.5tr",
      image:
        "https://images.unsplash.com/photo-1599707367072-cd6cf6cb521e?q=80&w=2000&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Khám phá hang động Quảng Bình",
      author: "Sarah Nguyễn",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      likes: 562,
      days: 4,
      budget: "6.0tr",
      image:
        "https://images.unsplash.com/photo-1534057376219-580b4a782a4c?q=80&w=2000&auto=format&fit=crop",
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khám phá</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm điểm đến, lịch trình..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryChip,
                activeCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trending Destinations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Điểm đến thịnh hành 🔥</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trendingDestinations.map((item) => (
              <TouchableOpacity key={item.id} style={styles.destinationCard}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.destinationImage}
                />
                <View style={styles.destinationOverlay}>
                  <Text style={styles.destinationName}>{item.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>⭐ {item.rating}</Text>
                    <Text style={styles.reviewText}> ({item.reviews})</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Community Trips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cộng đồng chia sẻ 👥</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {communityTrips.map((trip) => (
            <TouchableOpacity key={trip.id} style={styles.tripCard}>
              <Image source={{ uri: trip.image }} style={styles.tripImage} />
              <View style={styles.tripContent}>
                <Text style={styles.tripTitle} numberOfLines={2}>
                  {trip.title}
                </Text>
                <View style={styles.tripMeta}>
                  <Text style={styles.tripMetaText}>📅 {trip.days} ngày</Text>
                  <Text style={styles.tripMetaText}>💰 {trip.budget}</Text>
                </View>
                <View style={styles.authorContainer}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <Image
                      source={{ uri: trip.avatar }}
                      style={styles.authorAvatar}
                    />
                    <Text style={styles.authorName} numberOfLines={1}>
                      {trip.author}
                    </Text>
                  </View>
                  <View style={styles.likesContainer}>
                    <Text style={styles.likesText}>❤️ {trip.likes}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  backButtonText: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
  content: { flex: 1 },
  searchContainer: {
    padding: 20,
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginTop: -10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#333" },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFF",
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  categoryChipActive: { backgroundColor: "#667eea", borderColor: "#667eea" },
  categoryText: { color: "#666", fontWeight: "600" },
  categoryTextActive: { color: "#FFF" },
  section: { marginTop: 25, paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  seeAll: { color: "#667eea", fontWeight: "600" },
  destinationCard: {
    width: 160,
    height: 220,
    borderRadius: 16,
    marginRight: 15,
    overflow: "hidden",
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  destinationImage: { width: "100%", height: "100%" },
  destinationOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  destinationName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  ratingText: { color: "#FFD700", fontSize: 12, fontWeight: "bold" },
  reviewText: { color: "#FFF", fontSize: 10, opacity: 0.8 },
  tripCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tripImage: { width: 120, height: 120 },
  tripContent: { flex: 1, padding: 12, justifyContent: "space-between" },
  tripTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  tripMeta: { flexDirection: "row", marginBottom: 8 },
  tripMetaText: {
    fontSize: 12,
    color: "#666",
    marginRight: 12,
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  authorAvatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
  authorName: { fontSize: 12, color: "#666", flex: 1 },
  likesContainer: { flexDirection: "row", alignItems: "center" },
  likesText: { fontSize: 12, color: "#666" },
});

export default DiscoverScreen;
