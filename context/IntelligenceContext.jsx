import React, { createContext, useCallback, useContext } from "react";
import { CompoundingIntelligenceService } from "../services/compoundingIntelligenceService";

/**
 * @typedef {Object} IntelligenceContextType
 * @property {Function} trackAction
 * @property {Function} submitUserFeedback
 * @property {Function} getRecommendations
 * @property {Function} getIntelligenceScore
 */

const IntelligenceContext = createContext(undefined);

export const IntelligenceProvider = ({ children }) => {
  const trackAction = useCallback(
    async (userId, action, category, value, metadata) => {
      try {
        await CompoundingIntelligenceService.trackUserBehavior(
          userId,
          action,
          category,
          value,
          metadata,
        );
      } catch (error) {
        console.error("Error tracking action:", error);
      }
    },
    [],
  );

  const submitUserFeedback = useCallback(
    async (userId, itemType, rating, comment, tripId, itemId, category) => {
      try {
        await CompoundingIntelligenceService.submitFeedback(
          userId,
          itemType,
          rating,
          comment,
          tripId,
          itemId,
          category,
        );
      } catch (error) {
        console.error("Error submitting feedback:", error);
      }
    },
    [],
  );

  const getRecommendations = useCallback(async (userId) => {
    try {
      return await CompoundingIntelligenceService.getPersonalizedRecommendations(
        userId,
      );
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return [];
    }
  }, []);

  const getIntelligenceScore = useCallback(async (userId) => {
    try {
      return await CompoundingIntelligenceService.getUserIntelligenceScore(
        userId,
      );
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
  }, []);

  const value = {
    trackAction,
    submitUserFeedback,
    getRecommendations,
    getIntelligenceScore,
  };

  return (
    <IntelligenceContext.Provider value={value}>
      {children}
    </IntelligenceContext.Provider>
  );
};

export const useIntelligence = () => {
  const context = useContext(IntelligenceContext);
  if (!context) {
    throw new Error("useIntelligence must be used within IntelligenceProvider");
  }
  return context;
};
