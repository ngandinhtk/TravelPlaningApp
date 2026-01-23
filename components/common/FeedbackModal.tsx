import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Modal from "react-native-modal";
import { submitFeedback } from "../../services/compoundingIntelligenceService";

interface FeedbackModalProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string;
  itemType: string; // 'place', 'activity', 'recommendation', etc.
  itemId?: string;
  tripId?: string;
  category?: string;
  title?: string;
  onSubmitSuccess?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isVisible,
  onClose,
  userId,
  itemType,
  itemId,
  tripId,
  category,
  title = "How was this?",
  onSubmitSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setLoading(true);
    try {
      await submitFeedback(
        userId,
        itemType,
        rating,
        comment,
        tripId,
        itemId,
        category,
      );

      setComment("");
      setRating(0);
      onClose();
      onSubmitSuccess?.();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      backdropOpacity={0.4}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={styles.container}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.title}>{title}</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Rating Stars */}
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Your rating:</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Text style={styles.star}>{rating >= star ? "⭐" : "☆"}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <Text style={styles.ratingText}>
                {rating === 5
                  ? "Amazing! 🎉"
                  : rating === 4
                    ? "Great! 😊"
                    : rating === 3
                      ? "Good 👍"
                      : rating === 2
                        ? "Could be better 🤔"
                        : "Need improvement 😔"}
              </Text>
            )}
          </View>

          {/* Comment Box */}
          <View style={styles.commentContainer}>
            <Text style={styles.commentLabel}>Add a comment (optional):</Text>
            <TextInput
              style={styles.input}
              placeholder="What did you think?"
              placeholderTextColor="#999"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              💡 Your feedback helps us learn and improve recommendations for
              you!
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitButtonGradient}
          >
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitText}>
                {loading ? "Saving..." : "Submit Feedback"}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    maxHeight: "85%",
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 8,
  },
  starButton: {
    padding: 8,
  },
  star: {
    fontSize: 36,
  },
  ratingText: {
    textAlign: "center",
    fontSize: 14,
    color: "#667eea",
    fontWeight: "600",
    marginTop: 8,
  },
  commentContainer: {
    marginBottom: 16,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    minHeight: 80,
    backgroundColor: "#f9f9f9",
  },
  helpContainer: {
    backgroundColor: "#f0f4ff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  helpText: {
    fontSize: 12,
    color: "#667eea",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  cancelText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  submitButtonGradient: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  submitButton: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
