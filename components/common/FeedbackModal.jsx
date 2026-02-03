import { Ionicons } from "@expo/vector-icons"; // Make sure @expo/vector-icons is installed
import { useState } from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const FeedbackModal = ({ isVisible, onClose, onSubmit, title }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const handleStarPress = (rate) => {
    setRating(rate);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Vui lòng chọn số sao đánh giá.");
      return;
    }
    onSubmit({ rating, review });
    // Reset state for next time
    setRating(0);
    setReview("");
  };

  const handleClose = () => {
    setRating(0);
    setReview("");
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title || "Đánh giá địa điểm"}</Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((rate) => (
              <TouchableOpacity
                key={rate}
                onPress={() => handleStarPress(rate)}
              >
                <Ionicons
                  name={rating >= rate ? "star" : "star-outline"}
                  size={32}
                  color={rating >= rate ? "#FFD700" : "#ccc"}
                  style={{ marginHorizontal: 5 }}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.reviewInput}
            placeholder="Viết review của bạn ở đây (tùy chọn)..."
            value={review}
            onChangeText={setReview}
            multiline
            placeholderTextColor="#999"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={handleClose}
            >
              <Text style={styles.closeButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSubmit]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  reviewInput: {
    width: "100%",
    height: 100,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 15,
    textAlignVertical: "top",
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonClose: {
    backgroundColor: "#E0E0E0",
  },
  buttonSubmit: {
    backgroundColor: "#667eea",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  closeButtonText: {
    color: "#1A1A1A",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});

export default FeedbackModal;
