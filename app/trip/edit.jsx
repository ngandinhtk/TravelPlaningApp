import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { useTrip } from "../../context/TripContext";
import { updateTrip } from "../../services/tripService";

const EditTripScreen = () => {
  const router = useRouter();
  const { trip, setTrip: setTripInContext } = useTrip(); // Lấy trip từ Context

  const [destinations, setDestinations] = useState([""]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [travelers, setTravelers] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    // Khi trip từ context có sẵn, cập nhật state của form
    if (trip) {
      if (trip.destination) {
        // Tách chuỗi thành mảng nếu có dấu " - ", hoặc giữ nguyên nếu không
        const destArray = trip.destination.split(" - ");
        setDestinations(destArray.length > 0 ? destArray : [""]);
      }
      setTravelers(String(trip.travelers));
      setBudget(String(trip.budget));
      setNotes(trip.notes);

      // Chuyển đổi chuỗi ngày tháng 'DD/MM/YYYY' thành đối tượng Date
      const dateParts = trip.dates.split(" - ");
      const [startDay, startMonth, startYear] = dateParts[0].split("/");
      const [endDay, endMonth, endYear] = dateParts[1].split("/");
      setStartDate(new Date(`${startYear}-${startMonth}-${startDay}`));
      setEndDate(new Date(`${endYear}-${endMonth}-${endDay}`));
    }
  }, [trip]);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleUpdateTrip = async () => {
    const destinationString = destinations
      .filter((d) => d.trim() !== "")
      .join(" - ");

    if (!destinationString || !startDate || !endDate) {
      setError("Vui lòng điền đầy đủ các trường thông tin cần thiết.");
      return;
    }

    const timeDiff = endDate.getTime() - startDate.getTime();
    const calculatedDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    const updatedData = {
      destination: destinationString,
      dates: `${formatDate(startDate)} - ${formatDate(endDate)}`,
      travelers: parseInt(travelers, 10),
      budget: parseFloat(budget),
      days: calculatedDays,
      notes: notes,
    };

    try {
      await updateTrip(trip.id, updatedData);
      // Cập nhật lại trip trong context để các màn hình khác có dữ liệu mới
      setTripInContext({ ...trip, ...updatedData });

      setSuccessMessage("Cập nhật chuyến đi thành công!");
      setTimeout(() => {
        setSuccessMessage(null);
        router.push("/home/home"); // Quay về trang chủ và làm mới
      }, 2000);
    } catch (e) {
      console.error("Lỗi khi cập nhật chuyến đi:", e);
      setError("Không thể cập nhật chuyến đi. Vui lòng thử lại.");
    }
  };

  const handleStartDateChange = (date) => {
    setShowStartDatePicker(false);
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setShowEndDatePicker(false);
    setEndDate(date);
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

  if (Platform.OS === "web") {
    require("react-datepicker/dist/react-datepicker.css");
  }

  let DatePicker;
  if (Platform.OS === "web") {
    const ReactDatePicker = require("react-datepicker").default;
    DatePicker = ReactDatePicker;
  }

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

  // Nếu trip chưa được tải xong, hiển thị loading
  if (!trip) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={{ marginTop: 10 }}>Đang tải thông tin chuyến đi...</Text>
      </View>
    );
  }

  return (
    <View style={styles.createTripContainer}>
      <CustomModal
        visible={!!error}
        title="Lỗi"
        onClose={() => setError(null)}
        onConfirm={() => setError(null)}
      >
        <Text>{error}</Text>
      </CustomModal>
      <CustomModal
        visible={!!successMessage}
        title="Thành công"
        onClose={() => setSuccessMessage(null)}
        onConfirm={() => setSuccessMessage(null)}
      >
        <Text>{successMessage}</Text>
      </CustomModal>

      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.createTripHeader}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButtonTextWhite}>&larr; Back</Text>
        </TouchableOpacity>
        <Text style={styles.createTripTitle}>Chỉnh sửa chuyến đi</Text>
        <View style={{ width: 80 }} />
      </LinearGradient>

      <ScrollView
        style={styles.createTripForm}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Điểm đến</Text>
          {destinations.map((dest, index) => (
            <View key={index} style={styles.destinationRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={dest}
                onChangeText={(text) => handleChangeDestination(text, index)}
                placeholder={`Điểm đến ${index + 1}`}
              />
              {destinations.length > 1 && (
                <TouchableOpacity
                  onPress={() => handleRemoveDestination(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity
            onPress={handleAddDestination}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+ Thêm điểm đến</Text>
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
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Ngày kết thúc</Text>
            <TouchableOpacity
              onPress={() => setShowEndDatePicker(true)}
              style={styles.input}
            >
              <Text style={styles.dateText}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Số lượng người đi</Text>
          <TextInput
            style={styles.input}
            value={travelers}
            onChangeText={setTravelers}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Ngân sách ($)</Text>
          <TextInput
            style={styles.input}
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Ghi chú</Text>
          <TextInput
            style={styles.input}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleUpdateTrip}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.nextButtonText}>Lưu thay đổi</Text>
          </LinearGradient>
        </TouchableOpacity>

        {Platform.OS === "web" ? (
          renderWebPicker()
        ) : (
          <>
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
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
  createTripForm: {
    flex: 1,
    padding: 20,
    marginTop: 10,
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
  destinationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  removeButton: {
    marginLeft: 10,
    padding: 5,
  },
  removeButtonText: {
    fontSize: 24,
    color: "#e74c3c",
    fontWeight: "bold",
  },
  addButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#eef0ff",
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "600",
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

export default EditTripScreen;
