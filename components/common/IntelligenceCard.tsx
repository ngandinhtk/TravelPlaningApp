import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    AIInsight,
    getPersonalizedRecommendations,
    getUserIntelligenceScore,
} from "../../services/compoundingIntelligenceService";

interface IntelligenceCardProps {
  userId: string;
  onFeedbackPress?: () => void;
}

export const IntelligenceCard: React.FC<IntelligenceCardProps> = ({
  userId,
  onFeedbackPress,
}) => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState("🌱 Novice");
  const [recommendations, setRecommendations] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const loadIntelligenceData = useCallback(async () => {
    try {
      const [scoreData, recs] = await Promise.all([
        getUserIntelligenceScore(userId),
        getPersonalizedRecommendations(userId),
      ]);

      setScore(scoreData.score);
      setLevel(scoreData.level);
      setRecommendations(recs);
    } catch (error) {
      console.error("Error loading intelligence data:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadIntelligenceData();
  }, [loadIntelligenceData]);

  const getProgressColor = (score: number): string[] => {
    if (score >= 90) return ["#ff6b6b", "#ff8e72"];
    if (score >= 70) return ["#ffd93d", "#ffa502"];
    if (score >= 50) return ["#6bcf7f", "#4ec970"];
    if (score >= 30) return ["#4ecdc4", "#44b8aa"];
    return ["#95a5a6", "#7f8c8d"];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Intelligence Score Card */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.scoreCard}
      >
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreTitle}>🧠 AI Intelligence</Text>
          <Text style={styles.scoreLevel}>{level}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <LinearGradient
              colors={getProgressColor(score) as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBar, { width: `${score}%` }]}
            />
          </View>
          <Text style={styles.scoreText}>{score}/100</Text>
        </View>

        {/* Score Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>📊</Text>
            <Text style={styles.statLabel}>Learning</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⭐</Text>
            <Text style={styles.statLabel}>Improving</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>🚀</Text>
            <Text style={styles.statLabel}>Growing</Text>
          </View>
        </View>

        <Text style={styles.scoreDescription}>
          More interactions & feedback = Smarter recommendations
        </Text>
      </LinearGradient>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>💡 Smart Recommendations</Text>

          {recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationCard}>
              <View style={styles.recHeader}>
                <Text style={styles.recTitle}>{rec.title}</Text>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>
                    {Math.round(rec.confidence * 100)}%
                  </Text>
                </View>
              </View>
              <Text style={styles.recDescription}>{rec.description}</Text>

              {rec.actionable && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={onFeedbackPress}
                >
                  <Text style={styles.actionButtonText}>
                    Help me get better →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Empty State */}
      {recommendations.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateEmoji}>📚</Text>
          <Text style={styles.emptyStateTitle}>Start learning!</Text>
          <Text style={styles.emptyStateText}>
            Rate trips, places, and activities to unlock personalized
            recommendations
          </Text>
        </View>
      )}

      {/* Refresh Button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={loadIntelligenceData}
      >
        <Text style={styles.refreshButtonText}>🔄 Refresh Insights</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  scoreCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  scoreHeader: {
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 4,
  },
  scoreLevel: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  scoreText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 12,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  scoreDescription: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  recommendationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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
  confidenceBadge: {
    backgroundColor: "#667eea",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  confidenceText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  recDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: "#f0f4ff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#667eea",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    marginVertical: 20,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  refreshButton: {
    backgroundColor: "#667eea",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
