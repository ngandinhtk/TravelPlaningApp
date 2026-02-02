import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import CustomModal from "../../components/common/Modal";
import { useIntelligence } from "../../context/IntelligenceContext";
import { useUser } from "../../context/UserContext";
import { createInitialItineraries } from "../../services/itineraryService";
import { addTrip } from "../../services/tripService";

const CreateTripScreen = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [destinations, setDestinations] = useState([""]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [travelers, setTravelers] = useState("2");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [tripId, setTripId] = useState(Date.now());
  const [interests, setInterests] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const { user } = useUser();
  const { trackAction } = useIntelligence();
  const [error, setError] = useState(null);
  const interestOptions = [
    { emoji: "🏖️", name: "Biển" },
    { emoji: "🏔️", name: "Núi" },
    { emoji: "🍜", name: "Ẩm thực" },
    { emoji: "🎨", name: "Văn hóa" },
    { emoji: "🏛️", name: "Lịch sử" },
    { emoji: "🎢", name: "Phiêu lưu" },
  ];
  // console.log(Platform.OS === 'web' ? 'Running on Web' : 'Running on Native');

  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleAddDestination = () => {
    setDestinations([...destinations, ""]);
  };

  const handleRemoveDestination = (index) => {
    const newDestinations = destinations.filter((_, i) => i !== index);
    setDestinations(newDestinations);
  };

  const handleChangeDestination = (text, index) => {
    const newDestinations = [...destinations];
    newDestinations[index] = text;
    setDestinations(newDestinations);
  };

  const handleCreateTrip = async () => {
    const destination = destinations
      .filter((d) => d.trim())
      .map((d) => {
        const trimmed = d.trim();
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      })
      .join(" - ");
    // console.log(destination, startDate, endDate);

    if (!destination || !startDate.toDateString() || !endDate.toDateString()) {
      setError("Vui lòng điền đầy đủ các trường thông tin cần thiết.");
      return;
    }

    try {
      const start = startDate;
      const end = endDate;
      const timeDiff = end.getTime() - start.getTime();
      const calculatedDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

      if (end < start) {
        setError("Ngày kết thúc không thể trước ngày bắt đầu.");
        return;
      }
      const startStr = formatDate(startDate);
      const endStr = formatDate(endDate);

      // Create itineraries based on destinations and days
      const cleanDestinations = destinations
        .filter((d) => d.trim())
        .map((d) => {
          const trimmed = d.trim();
          return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        });
      const itineraries = createInitialItineraries(
        cleanDestinations,
        calculatedDays,
      );

      // setTripId(tripId + 1);
      await addTrip({
        userId: user?.uid,
        userName: user?.displayName,
        userEmail: user?.email,
        destination: destination,
        dates: `${startStr} - ${endStr}`,
        countryCode: null,
        status: updateTripStatus({ startDate, endDate, status: "planning" }),
        travelers: parseInt(travelers) || 0,
        budget: parseFloat(budget) || 0,
        days: calculatedDays,
        interests,
        tripId,
        notes: notes || "",
        itinerary: itineraries,
      });

      // Track trip creation behavior
      if (user?.uid) {
        await trackAction(user.uid, "trip_created", "trip", {
          destination,
          days: calculatedDays,
          budget: parseFloat(budget) || 0,
          travelers: parseInt(travelers) || 0,
          interests: interests,
        });
      }

      setSuccessMessage("Tạo chuyến đi thành công!");
      setTimeout(() => {
        setSuccessMessage(null);
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error creating trip:", error);
      setError("Tạo chuyến đi thất bại.");
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  if (Platform.OS === "web") {
    require("react-datepicker/dist/react-datepicker.css");
  }

  let DatePicker; // Will be assigned conditionally
  if (Platform.OS === "web") {
    const ReactDatePicker = require("react-datepicker").default;
    DatePicker = ReactDatePicker;
  }

  const updateTripStatus = (trip) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Handle both Date objects and Firebase Timestamps
    const endDate = trip.endDate.toDate
      ? trip.endDate.toDate()
      : new Date(trip.endDate);
    endDate.setHours(23, 59, 59, 999);

    const startDate = trip.startDate.toDate
      ? trip.startDate.toDate()
      : new Date(trip.startDate);

    if (trip.status === "archived") return "Archived";
    if (endDate < today) return "Past";
    if (startDate > today) return "Upcoming";
    return "Upcoming";
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    setShowStartDatePicker(false);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    setShowEndDatePicker(false);
  };

  const renderNativePicker = () => (
    <>
      {showStartDatePicker && (
        <DateTimePickerModal
          isVisible={showStartDatePicker}
          mode="date"
          onConfirm={handleStartDateChange}
          onCancel={() => setShowStartDatePicker(false)}
          date={startDate}
          display="spinner"
          textColor="#333"
          accentColor="#667eea"
          headerTextIOS="Chọn ngày bắt đầu"
          cancelTextIOS="Hủy"
          confirmTextIOS="Xác nhận"
          locale="vi_VN"
        />
      )}
      {showEndDatePicker && (
        <DateTimePickerModal
          isVisible={showEndDatePicker}
          mode="date"
          onConfirm={handleEndDateChange}
          onCancel={() => setShowEndDatePicker(false)}
          date={endDate}
          minimumDate={startDate}
          display="spinner"
          textColor="#333"
          accentColor="#667eea"
          headerTextIOS="Chọn ngày kết thúc"
          cancelTextIOS="Hủy"
          confirmTextIOS="Xác nhận"
          locale="vi_VN"
        />
      )}
    </>
  );

  const renderWebPicker = () => (
    <>
      {showStartDatePicker && (
        <div
          style={styles.webPickerOverlay}
          onClick={() => setShowStartDatePicker(false)}
        >
          <div
            style={styles.webPickerContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <Text style={styles.webPickerTitle}>Chọn ngày bắt đầu</Text>
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              dateFormat="dd/MM/yyyy"
              inline
            />
            <button
              onClick={() => setShowStartDatePicker(false)}
              style={styles.webPickerButton}
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}
      {showEndDatePicker && (
        <div
          style={styles.webPickerOverlay}
          onClick={() => setShowEndDatePicker(false)}
        >
          <div
            style={styles.webPickerContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <Text style={styles.webPickerTitle}>Chọn ngày kết thúc</Text>
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              dateFormat="dd/MM/yyyy"
              minDate={startDate}
              inline
            />
            <button
              onClick={() => setShowEndDatePicker(false)}
              style={styles.webPickerButton}
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <View style={styles.createTripContainer}>
      <CustomModal
        visible={!!error}
        title="Thông Báo Lỗi"
        onClose={() => setError(null)}
        onConfirm={() => setError(null)}
      >
        <Text>{error}</Text>
      </CustomModal>

      <CustomModal
        visible={!!successMessage}
        title="Thành Công"
        onClose={() => setSuccessMessage(null)}
        onConfirm={() => setSuccessMessage(null)}
      >
        <Text>{successMessage}</Text>
      </CustomModal>

      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.createTripHeader}
      >
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backButtonTextWhite}>&larr; </Text>
        </TouchableOpacity>
        <Text style={styles.createTripTitle}>Tạo chuyến đi</Text>
        <Text style={styles.stepIndicator}>Bước {step}/3</Text>
      </LinearGradient>

      <ScrollView
        style={styles.createTripForm}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Bạn muốn đi đâu? ✈️</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Điểm đến</Text>
              {destinations.map((dest, index) => (
                <View
                  key={index}
                  style={{ flexDirection: "row", marginBottom: 10 }}
                >
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder={`Điểm đến ${index + 1}`}
                    value={dest}
                    onChangeText={(text) =>
                      handleChangeDestination(text, index)
                    }
                    placeholderTextColor="#999"
                  />
                  {destinations.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveDestination(index)}
                      style={{
                        justifyContent: "center",
                        marginLeft: 10,
                        padding: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: "red",
                          fontSize: 20,
                          fontWeight: "bold",
                        }}
                      >
                        ×
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity
                onPress={handleAddDestination}
                style={{ marginTop: 5 }}
              >
                <Text style={{ color: "#667eea", fontWeight: "600" }}>
                  + Thêm điểm đến khác
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Ngày bắt đầu</Text>
                <TouchableOpacity
                  onPress={() => setShowStartDatePicker(true)}
                  style={styles.input}
                >
                  <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                </TouchableOpacity>
                {Platform.OS === "web"
                  ? renderWebPicker()
                  : renderNativePicker()}
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Ngày kết thúc</Text>
                <TouchableOpacity
                  onPress={() => setShowEndDatePicker(true)}
                  style={styles.input}
                >
                  <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                </TouchableOpacity>
                {Platform.OS === "web"
                  ? renderWebPicker()
                  : renderNativePicker()}
              </View>
            </View>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => setStep(2)}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.nextButtonText}>Tiếp theo</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Ai đi cùng & ngân sách? 💰</Text>
            <Text style={styles.stepSubtitle}>
              Hãy cho chúng tôi biết bạn đồng hành với ai.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số lượng người đi</Text>
              <TextInput
                style={styles.input}
                placeholder="ví dụ: 2"
                value={travelers}
                onChangeText={setTravelers}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ngân sách mỗi người</Text>
              <TextInput
                style={styles.input}
                placeholder="ví dụ: 1000"
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ghi chú</Text>
              <TextInput
                style={styles.input}
                placeholder="ví dụ: mang theo áo ấm"
                value={notes}
                onChangeText={setNotes}
                keyboardType="default"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.nextButton, { flex: 1, marginLeft: 10 }]}
                onPress={() => setStep(1)}
              >
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.secondaryButtonText}></Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.nextButton, { flex: 1, marginLeft: 10 }]}
                onPress={() => setStep(3)}
              >
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.nextButtonText}>Tiếp theo</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Sở thích của bạn 💫</Text>
            <Text style={styles.stepSubtitle}>
              Chọn những gì bạn thích (tùy chọn)
            </Text>

            <View style={styles.interestsGrid}>
              {interestOptions.map((interest, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.interestChip,
                    interests.includes(interest.name) &&
                      styles.interestChipActive,
                  ]}
                  onPress={() => toggleInterest(interest.name)}
                >
                  <Text style={styles.interestChipEmoji}>{interest.emoji}</Text>
                  <Text
                    style={[
                      styles.interestChipText,
                      interests.includes(interest.name) &&
                        styles.interestChipTextActive,
                    ]}
                  >
                    {interest.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.nextButton, { flex: 1, marginLeft: 10 }]}
                onPress={() => setStep(1)}
              >
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.secondaryButtonText}></Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.nextButton, { flex: 1, marginLeft: 10 }]}
                onPress={handleCreateTrip}
              >
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.nextButtonText}>Tạo chuyến đi ✨</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

// Vui lòng thêm styles từ tệp gốc của bạn vào đây
const styles = StyleSheet.create({
  createTripContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  createTripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  backButtonTextWhite: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  createTripTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  stepIndicator: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  createTripForm: {
    flex: 1,
    padding: 20,
    marginTop: 10,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 10,
  },
  stepSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
  },
  dateText: {
    fontSize: 16,
  },
  inputRow: {
    flexDirection: "row",
  },
  nextButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: "hidden",
    zIndex: -1,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 12,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#E0E0E0",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 20,
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 20,
  },
  interestChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  interestChipActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  interestChipEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  interestChipText: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  interestChipTextActive: {
    color: "#FFFFFF",
  },
  // Web Date Picker Styles
  webPickerOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  webPickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    maxWidth: 400,
    alignItems: "center",
  },
  webPickerButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#667eea",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  },
  webPickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
});

export default CreateTripScreen;
