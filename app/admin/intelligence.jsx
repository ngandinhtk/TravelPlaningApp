import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FeedbackModal } from "../../components/common/FeedbackModal";
import { useUser } from "../../context/UserContext";
import {
  getPersonalizedRecommendations,
  getUserIntelligenceScore,
} from "../../services/compoundingIntelligenceService";

const { width } = Dimensions.get("window");

const IntelligenceDashboard = () => {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState("🌱 Novice");
  const [stats, setStats] = useState({
    behaviors: 0,
    feedbacks: 0,
    insights: 0,
  });
  const [recommendations, setRecommendations] = useState([]);
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, [user?.uid]);

  const loadData = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const [scoreData, recs] = await Promise.all([
        getUserIntelligenceScore(user.uid),
        getPersonalizedRecommendations(user.uid),
      ]);

      setScore(scoreData.score);
      setLevel(scoreData.level);
      setStats({
        behaviors: scoreData.behaviors,
        feedbacks: scoreData.feedbacks,
        insights: scoreData.insights,
      });
      setRecommendations(recs);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (score) => {
    if (score >= 90) return ["#ff6b6b", "#ff8e72"];
    if (score >= 70) return ["#ffd93d", "#ffa502"];
    if (score >= 50) return ["#6bcf7f", "#4ec970"];
    if (score >= 30) return ["#4ecdc4", "#44b8aa"];
    return ["#667eea", "#764ba2"]; // Đổi màu xám thành màu theme tím/xanh
  };

  const getLevelLabel = (lvl) => {
    if (!lvl) return "";
    if (lvl.includes("Novice")) return "🌱 Người mới";
    if (lvl.includes("Learning")) return "📈 Đang học hỏi";
    if (lvl.includes("Smart")) return "🎯 Thông minh";
    if (lvl.includes("Expert")) return "⭐ Chuyên gia";
    if (lvl.includes("Genius")) return "🔥 Thiên tài";
    return lvl;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>
          Đang tải dữ liệu trí tuệ nhân tạo...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section - Intelligence Score */}
      <LinearGradient
        colors={getLevelColor(score)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNumber}>{score}</Text>
          <Text style={styles.scoreLabel}>/100</Text>
        </View>

        <View style={styles.levelInfo}>
          <Text style={styles.levelText}>{getLevelLabel(level)}</Text>
          <Text style={styles.levelDescription}>
            Mức độ thấu hiểu của ứng dụng về bạn
          </Text>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <Text style={styles.statIcon}>📊</Text>
          <Text style={styles.statNumber}>{stats.behaviors}</Text>
          <Text style={styles.statName}>Hành vi đã ghi nhận</Text>
          <Text style={styles.statDesc}>Các thao tác của bạn</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#f093fb", "#f5576c"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <Text style={styles.statIcon}>⭐</Text>
          <Text style={styles.statNumber}>{stats.feedbacks}</Text>
          <Text style={styles.statName}>Đánh giá đã gửi</Text>
          <Text style={styles.statDesc}>Phản hồi của bạn</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#4facfe", "#00f2fe"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <Text style={styles.statIcon}>💡</Text>
          <Text style={styles.statNumber}>{stats.insights}</Text>
          <Text style={styles.statName}>Góc nhìn AI</Text>
          <Text style={styles.statDesc}>Phát hiện thông minh</Text>
        </LinearGradient>
      </View>

      {/* How It Works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧠 Cơ chế hoạt động</Text>

        <View style={styles.stepContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Ghi nhận hành vi</Text>
              <Text style={styles.stepDesc}>
                Mọi chuyến đi, địa điểm và lựa chọn đều được ghi lại
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Thu thập phản hồi</Text>
              <Text style={styles.stepDesc}>
                Đánh giá sở thích để cải thiện độ chính xác
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>AI học tập</Text>
              <Text style={styles.stepDesc}>
                Hệ thống nhận diện thói quen và sở thích
              </Text>
            </View>
          </View>

          <View style={[styles.step, { borderBottomWidth: 0 }]}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Gợi ý thông minh</Text>
              <Text style={styles.stepDesc}>
                Các đề xuất cá nhân hóa ngày càng chính xác
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Gợi ý mới nhất</Text>

          {recommendations.map((rec, index) => (
            <View key={index} style={styles.recCard}>
              <View style={styles.recHeader}>
                <Text style={styles.recTitle}>{rec.title}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {Math.round(rec.confidence * 100)}% tin cậy
                  </Text>
                </View>
              </View>
              <Text style={styles.recDesc}>{rec.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Call to Action */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>🚀 Tăng điểm trí tuệ AI</Text>
        <Text style={styles.ctaDesc}>
          Càng tương tác và phản hồi nhiều, gợi ý càng trở nên thông minh hơn
        </Text>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => setFeedbackVisible(true)}
        >
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaButtonGradient}
          >
            <Text style={styles.ctaButtonText}>Gửi phản hồi ngay 📝</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshBtn} onPress={loadData}>
        <Text style={styles.refreshBtnText}>🔄 Làm mới dữ liệu</Text>
      </TouchableOpacity>

      <View style={styles.spacer} />

      <FeedbackModal
        isVisible={feedbackVisible}
        onClose={() => setFeedbackVisible(false)}
        userId={user?.uid || ""}
        itemType="app_feedback"
        title="Giúp chúng tôi cải thiện"
        onSubmitSuccess={loadData}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#667eea",
    fontWeight: "600",
  },
  heroSection: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  scoreNumber: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#fff",
  },
  scoreLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
  },
  levelInfo: {
    alignItems: "center",
  },
  levelText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  levelDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    marginTop: -20,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 60) / 3,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 6,
    marginBottom: 12,
    paddingVertical: 16,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  statName: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  statDesc: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  stepContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  step: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    color: "#999",
    lineHeight: 18,
  },
  recCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#667eea",
  },
  recHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  recDesc: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },
  badge: {
    backgroundColor: "#f0f4ff",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    color: "#667eea",
    fontWeight: "bold",
  },
  ctaSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  ctaDesc: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  ctaButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  ctaButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  refreshBtn: {
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#667eea",
    alignItems: "center",
    marginBottom: 12,
  },
  refreshBtnText: {
    color: "#667eea",
    fontWeight: "bold",
    fontSize: 14,
  },
  spacer: {
    height: 20,
  },
});

export default IntelligenceDashboard;
