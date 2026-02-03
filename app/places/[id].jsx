import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, Star } from "lucide-react-native";
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
import FeedbackModal from "../../components/common/FeedbackModal";
import { useIntelligence } from "../../context/IntelligenceContext";
import { useUser } from "../../context/UserContext";
import { db } from "../../services/firebase";

const PlaceDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const { submitUserFeedback } = useIntelligence(); // Using the function from context

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFeedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchPlace = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, "places", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPlace({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such document!");
          // Optional: Handle not found state
        }
      } catch (error) {
        console.error("Error fetching place:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlace();
  }, [id]);

  const handleOpenFeedbackModal = () => {
    setFeedbackModalVisible(true);
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModalVisible(false);
  };

  const handleFeedbackSubmit = async ({ rating, review }) => {
    if (!user) {
      alert("Bạn cần đăng nhập để gửi đánh giá.");
      return;
    }

    try {
      // The submitUserFeedback function from context would handle the API call
      await submitUserFeedback(
        user.uid,
        "place", // itemType
        place.id, // itemId
        rating,
        review,
        place.category,
      );

      setSuccessMessage("Cảm ơn bạn đã gửi đánh giá!");
      handleCloseFeedbackModal();

      // Hide success message after a few seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      alert("Gửi đánh giá thất bại. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!place) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy thông tin địa điểm.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {place.name}
        </Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView>
        <Image source={{ uri: place.image }} style={styles.headerImage} />
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{place.name}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.ratingContainer}>
              <Star size={18} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{place.rating}</Text>
              <Text style={styles.reviewsText}>({place.reviews} đánh giá)</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{place.category}</Text>
            </View>
          </View>

          <Text style={styles.description}>{place.description}</Text>

          {successMessage ? (
            <Text style={styles.successText}>{successMessage}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.reviewButton}
            onPress={handleOpenFeedbackModal}
          >
            <Text style={styles.reviewButtonText}>Viết đánh giá</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FeedbackModal
        isVisible={isFeedbackModalVisible}
        onClose={handleCloseFeedbackModal}
        onSubmit={handleFeedbackSubmit}
        title={`Bạn thấy ${place.name} thế nào?`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  backButton: {
    padding: 5,
  },
  headerImage: {
    width: "100%",
    height: 250,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: "bold",
  },
  reviewsText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  categoryBadge: {
    backgroundColor: "#eef0ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  categoryText: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "600",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  reviewButton: {
    marginTop: 30,
    backgroundColor: "#667eea",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  reviewButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  successText: {
    marginTop: 20,
    color: "green",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default PlaceDetailScreen;
