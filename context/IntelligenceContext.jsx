import { createContext, useContext, useEffect, useState } from "react";
import { intelligenceService } from "../services/compoundingIntelligenceService";

const IntelligenceContext = createContext(null);

export const IntelligenceProvider = ({ children, userId }) => {
  const [intelligenceScore, setIntelligenceScore] = useState(0);
  const [learningLevel, setLearningLevel] = useState("Novice");
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (userId) {
      refreshData();
    }
  }, [userId]);

  const refreshData = async () => {
    if (!userId) return;
    const data = await intelligenceService.getUserIntelligenceScore(userId);
    setIntelligenceScore(data.score);
    setLearningLevel(data.level);

    const recs =
      await intelligenceService.getPersonalizedRecommendations(userId);
    setRecommendations(recs);
  };

  const trackAction = async (action, category, value, metadata) => {
    if (!userId) return;
    await intelligenceService.trackUserBehavior(
      userId,
      action,
      category,
      value,
      metadata,
    );
  };

  const submitUserFeedback = async (
    itemType,
    rating,
    comment,
    tripId,
    itemId,
    category,
  ) => {
    if (!userId) return;
    await intelligenceService.submitFeedback(
      userId,
      itemType,
      rating,
      comment,
      tripId,
      itemId,
      category,
    );
    // Refresh score after feedback as it contributes heavily to the score
    await refreshData();
  };

  const getIntelligenceScore = async () => {
    if (!userId) return null;
    return await intelligenceService.getUserIntelligenceScore(userId);
  };

  return (
    <IntelligenceContext.Provider
      value={{
        intelligenceScore,
        learningLevel,
        recommendations,
        trackAction,
        submitUserFeedback,
        getIntelligenceScore,
        getRecommendations: () => recommendations,
      }}
    >
      {children}
    </IntelligenceContext.Provider>
  );
};

export const useIntelligence = () => {
  const context = useContext(IntelligenceContext);
  if (!context) {
    throw new Error(
      "useIntelligence must be used within an IntelligenceProvider",
    );
  }
  return context;
};
