import {
    addDoc,
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from "firebase/firestore";
import { db } from "./firebase";

// Collections
const userBehaviorCollection = collection(db, "userBehavior");
const feedbackCollection = collection(db, "feedback");
const aiInsightsCollection = collection(db, "aiInsights");
const userPreferencesCollection = collection(db, "userPreferences");

// Data types
export interface UserBehavior {
  userId: string;
  action: string; // 'trip_created', 'place_visited', 'budget_tracked', etc.
  category?: string; // 'destination', 'accommodation', 'activity', 'food', 'transport'
  value?: any; // trip details, place info, etc.
  timestamp: any;
  metadata?: Record<string, any>; // additional context
}

export interface UserFeedback {
  userId: string;
  tripId?: string;
  itemId?: string; // place, activity, etc.
  itemType: string; // 'place', 'activity', 'recommendation', 'suggestion'
  rating: number; // 1-5
  comment?: string;
  category?: string;
  helpful?: boolean;
  timestamp: any;
}

export interface AIInsight {
  userId: string;
  insightType: string; // 'trend', 'recommendation', 'prediction', 'pattern'
  title: string;
  description: string;
  confidence: number; // 0-1
  data: Record<string, any>;
  actionable: boolean;
  timestamp: any;
}

export interface UserPreference {
  userId: string;
  preference: Record<string, any>;
  score: number; // 0-100
  frequency: number; // how many times this pattern was seen
  lastUpdated: any;
}

// 1. BEHAVIOR TRACKING - Ghi lại hành động của người dùng
export const trackUserBehavior = async (
  userId: string,
  action: string,
  category?: string,
  value?: any,
  metadata?: Record<string, any>,
) => {
  try {
    const behavior: UserBehavior = {
      userId,
      action,
      category,
      value,
      timestamp: serverTimestamp(),
      metadata,
    };

    const docRef = await addDoc(userBehaviorCollection, behavior);

    // Trigger analysis for this user
    await analyzeUserPattern(userId);

    return docRef.id;
  } catch (error) {
    console.error("Error tracking behavior:", error);
    throw error;
  }
};

// 2. FEEDBACK COLLECTION - Thu thập feedback từ người dùng
export const submitFeedback = async (
  userId: string,
  itemType: string,
  rating: number,
  comment?: string,
  tripId?: string,
  itemId?: string,
  category?: string,
) => {
  try {
    const feedback: UserFeedback = {
      userId,
      tripId,
      itemId,
      itemType,
      rating,
      comment,
      category,
      helpful: rating >= 4, // 4-5 stars = helpful
      timestamp: serverTimestamp(),
    };

    const docRef = await addDoc(feedbackCollection, feedback);

    // Update user preferences based on feedback
    await updateUserPreferences(userId, itemType, rating, category);

    // Generate new insights if enough feedback
    await checkAndGenerateInsights(userId);

    return docRef.id;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
};

// 3. PATTERN ANALYSIS - Phân tích mô hình hành động
export const analyzeUserPattern = async (userId: string) => {
  try {
    // Get last 50 behaviors
    const q = query(
      userBehaviorCollection,
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
    );

    const snapshot = await getDocs(q);
    const behaviors = snapshot.docs.map((doc) => doc.data() as UserBehavior);

    if (behaviors.length < 3) return; // Need minimum data

    // Analyze patterns
    const patterns: Record<string, number> = {};
    const categoryPatterns: Record<string, number> = {};

    behaviors.forEach((behavior) => {
      patterns[behavior.action] = (patterns[behavior.action] || 0) + 1;
      if (behavior.category) {
        categoryPatterns[behavior.category] =
          (categoryPatterns[behavior.category] || 0) + 1;
      }
    });

    // Save top patterns as insights
    const topPatterns = Object.entries(patterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    for (const [action, count] of topPatterns) {
      const confidence = Math.min(count / behaviors.length, 1);
      if (confidence > 0.2) {
        // 20% threshold
        await createOrUpdateInsight(userId, "pattern", {
          action,
          frequency: count,
          confidence,
          categoryPatterns,
        });
      }
    }
  } catch (error) {
    console.error("Error analyzing user pattern:", error);
  }
};

// 4. PREFERENCE LEARNING - Học các sở thích người dùng
export const updateUserPreferences = async (
  userId: string,
  itemType: string,
  rating: number,
  category?: string,
) => {
  try {
    const key = category ? `${itemType}_${category}` : itemType;
    const querySnapshot = await getDocs(
      query(
        userPreferencesCollection,
        where("userId", "==", userId),
        where("preference.key", "==", key),
      ),
    );

    let score = (rating / 5) * 100;

    if (querySnapshot.empty) {
      // Create new preference
      await addDoc(userPreferencesCollection, {
        userId,
        preference: { key, type: itemType, category },
        score,
        frequency: 1,
        lastUpdated: serverTimestamp(),
      });
    } else {
      // Update existing preference with exponential smoothing
      const docId = querySnapshot.docs[0].id;
      const existing = querySnapshot.docs[0].data() as UserPreference;

      // Exponential smoothing: new_score = 0.7 * old_score + 0.3 * current_rating
      const newScore = existing.score * 0.7 + score * 0.3;

      await updateDoc(doc(userPreferencesCollection, docId), {
        score: newScore,
        frequency: existing.frequency + 1,
        lastUpdated: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error updating preferences:", error);
  }
};

// 5. INSIGHT GENERATION - Tạo insight AI
export const checkAndGenerateInsights = async (userId: string) => {
  try {
    const feedbackQ = query(feedbackCollection, where("userId", "==", userId));
    const feedbackSnapshot = await getDocs(feedbackQ);

    if (feedbackSnapshot.docs.length < 5) return; // Need minimum feedback

    const feedbacks = feedbackSnapshot.docs.map(
      (doc) => doc.data() as UserFeedback,
    );

    // Analyze feedback to find trends
    const itemTypeScores: Record<string, number[]> = {};
    const categoryScores: Record<string, number[]> = {};

    feedbacks.forEach((fb) => {
      if (!itemTypeScores[fb.itemType]) {
        itemTypeScores[fb.itemType] = [];
      }
      itemTypeScores[fb.itemType].push(fb.rating);

      if (fb.category) {
        if (!categoryScores[fb.category]) {
          categoryScores[fb.category] = [];
        }
        categoryScores[fb.category].push(fb.rating);
      }
    });

    // Find favorite categories/types
    for (const [category, ratings] of Object.entries(categoryScores)) {
      const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      if (avgRating >= 4 && ratings.length >= 3) {
        await createOrUpdateInsight(userId, "trend", {
          favCategory: category,
          avgRating,
          count: ratings.length,
        });
      }
    }

    // Identify weak preferences
    for (const [category, ratings] of Object.entries(categoryScores)) {
      const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      if (avgRating < 3 && ratings.length >= 2) {
        await createOrUpdateInsight(userId, "prediction", {
          avoidCategory: category,
          reason: "Low ratings in past",
          avgRating,
        });
      }
    }
  } catch (error) {
    console.error("Error generating insights:", error);
  }
};

// 6. CREATE/UPDATE INSIGHTS
const createOrUpdateInsight = async (
  userId: string,
  insightType: string,
  data: Record<string, any>,
) => {
  try {
    const insight: AIInsight = {
      userId,
      insightType,
      title: generateInsightTitle(insightType, data),
      description: generateInsightDescription(insightType, data),
      confidence: data.confidence || calculateConfidence(data),
      data,
      actionable: isActionable(insightType, data),
      timestamp: serverTimestamp(),
    };

    await addDoc(aiInsightsCollection, insight);
  } catch (error) {
    console.error("Error creating insight:", error);
  }
};

// 7. GET RECOMMENDATIONS - Lấy gợi ý cá nhân hóa
export const getPersonalizedRecommendations = async (
  userId: string,
  context?: Record<string, any>,
): Promise<AIInsight[]> => {
  try {
    const q = query(
      aiInsightsCollection,
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
    );

    const snapshot = await getDocs(q);
    const insights = snapshot.docs.map((doc) => doc.data() as AIInsight);

    // Get only actionable, recent insights
    const recommendations = insights
      .filter(
        (i) =>
          i.actionable &&
          i.insightType !== "prediction" &&
          !isInsightStale(i.timestamp),
      )
      .slice(0, 5);

    return recommendations;
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return [];
  }
};

// 8. GET USER INTELLIGENCE SCORE - Điểm thông minh của hệ thống
export const getUserIntelligenceScore = async (
  userId: string,
): Promise<{
  score: number;
  level: string;
  insights: number;
  behaviors: number;
  feedbacks: number;
}> => {
  try {
    const [behaviorSnap, feedbackSnap, insightSnap] = await Promise.all([
      getDocs(query(userBehaviorCollection, where("userId", "==", userId))),
      getDocs(query(feedbackCollection, where("userId", "==", userId))),
      getDocs(query(aiInsightsCollection, where("userId", "==", userId))),
    ]);

    const behaviors = behaviorSnap.docs.length;
    const feedbacks = feedbackSnap.docs.length;
    const insights = insightSnap.docs.length;

    // Calculate intelligence score
    const behaviorScore = Math.min(behaviors / 100, 1) * 30; // 30 points
    const feedbackScore = Math.min(feedbacks / 20, 1) * 40; // 40 points
    const insightScore = Math.min(insights / 10, 1) * 30; // 30 points

    const totalScore = Math.round(behaviorScore + feedbackScore + insightScore);

    const level =
      totalScore >= 90
        ? "🔥 Genius"
        : totalScore >= 70
          ? "⭐ Expert"
          : totalScore >= 50
            ? "🎯 Smart"
            : totalScore >= 30
              ? "📈 Learning"
              : "🌱 Novice";

    return { score: totalScore, level, insights, behaviors, feedbacks };
  } catch (error) {
    console.error("Error getting intelligence score:", error);
    return {
      score: 0,
      level: "🌱 Novice",
      insights: 0,
      behaviors: 0,
      feedbacks: 0,
    };
  }
};

// ============ HELPER FUNCTIONS ============

function generateInsightTitle(type: string, data: Record<string, any>): string {
  if (type === "trend" && data.favCategory) {
    return `❤️ You love ${data.favCategory}!`;
  }
  if (type === "prediction" && data.avoidCategory) {
    return `⚠️ Avoid ${data.avoidCategory}`;
  }
  if (type === "pattern" && data.action) {
    return `📊 ${data.action} pattern detected`;
  }
  return "💡 New Insight";
}

function generateInsightDescription(
  type: string,
  data: Record<string, any>,
): string {
  if (type === "trend" && data.favCategory) {
    return `Based on ${data.count} interactions, you consistently rate ${data.favCategory} highly (${data.avgRating.toFixed(1)}/5 ⭐)`;
  }
  if (type === "prediction" && data.avoidCategory) {
    return `Your past ratings suggest you might not enjoy ${data.avoidCategory} experiences`;
  }
  if (type === "pattern" && data.frequency) {
    return `You've done "${data.action}" ${data.frequency} times recently`;
  }
  return "App is learning about your preferences";
}

function calculateConfidence(data: Record<string, any>): number {
  if (data.frequency && data.confidence) {
    return Math.min(data.confidence * (data.frequency / 10), 0.95);
  }
  if (data.count) {
    return Math.min(data.count / 20, 0.9);
  }
  return 0.5;
}

function isActionable(type: string, data: Record<string, any>): boolean {
  if (type === "prediction") return data.avoidCategory ? true : false;
  if (type === "trend") return data.favCategory ? true : false;
  if (type === "pattern") return data.frequency > 2;
  return false;
}

function isInsightStale(timestamp: any): boolean {
  if (!timestamp) return false;
  const now = new Date().getTime();
  const insightTime = new Date(timestamp).getTime();
  const dayInMs = 24 * 60 * 60 * 1000;
  return now - insightTime > 30 * dayInMs; // Stale after 30 days
}

// Export for external use
export const CompoundingIntelligenceService = {
  trackUserBehavior,
  submitFeedback,
  analyzeUserPattern,
  updateUserPreferences,
  checkAndGenerateInsights,
  getPersonalizedRecommendations,
  getUserIntelligenceScore,
};
