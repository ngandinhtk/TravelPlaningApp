import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { db } from "../../services/firebase";

interface FeedbackModalProps {
  isVisible: boolean;
  onClose: () => void;
  userId?: string;
  itemType: string; // e.g., 'place', 'trip', 'template'
  itemId: string;
  category?: string; // e.g., 'beach', 'mountain', 'hotel'
  title?: string;
  tripId?: string; // Optional: link feedback to a specific trip context
}

const FeedbackModal = ({
  isVisible,
  onClose,
  userId,
  itemType,
  itemId,
  category,
  title = "Đánh giá trải nghiệm",
  tripId,
}: FeedbackModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert(
        "Chưa chọn đánh giá",
        "Vui lòng chọn số sao để chúng tôi biết cảm nhận của bạn nhé!",
      );
      return;
    }

    if (!userId) {
      Alert.alert("Yêu cầu đăng nhập", "Bạn cần đăng nhập để gửi đánh giá.");
      return;
    }

    setSubmitting(true);
    try {
      // Ghi dữ liệu vào collection 'feedback' trong Firestore
      // Đây là dữ liệu nền tảng cho hệ thống Compounding Intelligence sau này
      await addDoc(collection(db, "feedback"), {
        userId,
        itemType,
        itemId,
        rating,
        comment: comment.trim(),
        category: category || "general",
        tripId: tripId || null,
        createdAt: serverTimestamp(),
        helpful: true, // Mặc định feedback là hữu ích
      });

      Alert.alert("Cảm ơn!", "Đánh giá của bạn đã được ghi nhận.");

      // Reset form
      setRating(0);
      setComment("");
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert("Lỗi", "Không thể gửi đánh giá. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            activeOpacity={0.7}
            style={styles.starButton}
          >
            <Text style={[styles.star, rating >= star && styles.starSelected]}>
              {rating >= star ? "★" : "☆"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardView}
            >
              <View style={styles.container}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>Bạn cảm thấy thế nào?</Text>

                {renderStars()}

                <Text style={styles.label}>Nhận xét (Tùy chọn)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  value={comment}
                  onChangeText={setComment}
                  textAlignVertical="top"
                />

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleClose}
                    disabled={submitting}
                  >
                    <Text style={styles.cancelButtonText}>Đóng</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.submitButton]}
                    onPress={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  keyboardView: { width: "100%", alignItems: "center" },
  container: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  starButton: { marginHorizontal: 6 },
  star: { fontSize: 36, color: "#E0E0E0" },
  starSelected: { color: "#FFD700" },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    height: 100,
    fontSize: 14,
    color: "#333",
    marginBottom: 24,
  },
  buttonContainer: { flexDirection: "row", gap: 12 }, // Note: 'gap' works in newer RN versions. Use marginLeft on second button if issues arise.
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: { backgroundColor: "#F0F0F0" },
  submitButton: { backgroundColor: "#667eea" },
  cancelButtonText: { color: "#666", fontWeight: "600", fontSize: 16 },
  submitButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

export default FeedbackModal;
// export default FeedbackModal
