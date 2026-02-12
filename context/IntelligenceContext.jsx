import { createContext, useContext } from "react";
import { compoundingIntelligenceService } from "../services/compoundingIntelligenceService";

const IntelligenceContext = createContext(undefined);

export const IntelligenceProvider = ({ children }) => {
  /**
   * Tracks a user action.
   * This is the primary method for collecting behavioral data for the Compounding Intelligence system.
   *
   * @param {string} userId - The ID of the user performing the action.
   * @param {string} action - The name of the action (e.g., 'trip_viewed').
   * @param {string} [category] - The category of the action (e.g., 'trip').
   * @param {object} [value] - A value object with details about the action.
   * @param {object} [metadata] - Extra metadata about the context of the action.
   */
  const trackAction = async (userId, action, category, value, metadata) => {
    try {
      await compoundingIntelligenceService.trackUserBehavior({
        userId,
        action,
        category,
        value,
        metadata,
      });
    } catch (error) {
      console.error("Failed to track action:", error);
    }
  };

  const value = {
    trackAction,
  };

  return (
    <IntelligenceContext.Provider value={value}>
      {children}
    </IntelligenceContext.Provider>
  );
};

export const useIntelligence = () => {
  const context = useContext(IntelligenceContext);
  if (context === undefined) {
    throw new Error(
      "useIntelligence must be used within an IntelligenceProvider",
    );
  }
  return context;
};
