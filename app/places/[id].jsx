import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import FeedbackModal from "../../components/common/FeedbackModal";
import { useUser } from "../../context/UserContext";
import { SAMPLE_PLACES_DATA } from "../../services/placeService";

const PlaceDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const loadPlaceData = () => {
      setLoading(true);
      // LƯU Ý: Trong ứng dụng thực tế, bạn sẽ dùng `id` để fetch dữ liệu từ Firestore.
      // Ở đây, chúng ta tạm thời tìm trong dữ liệu mẫu `SAMPLE_PLACES_DATA`.
      // Chúng ta sẽ tìm place dựa trên `id` (giả định id là tên của địa điểm)
      const foundPlace = SAMPLE_PLACES_DATA.find((p) => p.name === id);

      if (foundPlace) {
        setPlace(foundPlace);
      } else {
        // Nếu không tìm thấy trong dữ liệu mẫu, bạn có thể thêm logic
        // để fetch từ Firestore tại đây.
        console.warn(`Place with id "${id}" not found in sample data.`);
      }
      setLoading(false);
    };

    if (id) {
      loadPlaceData();
    }
  }, [id]);

  const getCategoryEmoji = (category) => {
    const map = {
      History: "🏛️",
      Beach: "🏖️",
      Mountain: "🏔️",
      Food: "🍜",
      Culture: "🎨",
      Nature: "🌲",
    };
    return map[category] || "📍";
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!place) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Không tìm thấy thông tin địa điểm.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: place.imageUrl }} style={styles.image} />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.6)"]}
          style={styles.imageOverlay}
        />

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.placeName}>{place.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaEmoji}>⭐</Text>
              <Text style={styles.metaText}>{place.rating} (Đánh giá)</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaEmoji}>
                {getCategoryEmoji(place.category)}
              </Text>
              <Text style={styles.metaText}>{place.category}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaEmoji}>📍</Text>
              <Text style={styles.metaText}>{place.province}</Text>
            </View>
          </View>

          <Text style={styles.description}>{place.description}</Text>

          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => setShowFeedback(true)}
          >
            <Text style={styles.feedbackButtonText}>✍️ Viết đánh giá</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Tích hợp FeedbackModal */}
      <FeedbackModal
        isVisible={showFeedback}
        onClose={() => setShowFeedback(false)}
        userId={user?.uid}
        itemType="place"
        itemId={id} // Sử dụng id từ URL
        category={place.category}
        title={`Bạn thấy ${place.name} thế nào?`}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  backLink: {
    fontSize: 16,
    color: "#667eea",
    fontWeight: "600",
  },
  image: {
    width: "100%",
    height: 350,
  },
  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 350,
  },
  header: {
    position: "absolute",
    top: 40,
    left: 15,
  },
  backButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  contentContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  placeName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 15,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  metaItem: {
    alignItems: "center",
  },
  metaEmoji: {
    fontSize: 20,
  },
  metaText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  description: {
    fontSize: 16,
    color: "#333",
    lineHeight: 26,
    marginBottom: 25,
  },
  feedbackButton: {
    backgroundColor: "#667eea",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  feedbackButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PlaceDetailScreen;
