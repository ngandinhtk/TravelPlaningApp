import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { generateMockItinerary } from "../../lib/data";
const GeneratingScreen = ({ trip, onComplete }) => {
  const [progress, setProgress] = useState(0);

  const statuses = [
    "Đang phân tích sở thích của bạn...",
    "Đang tìm các điểm tham quan tốt nhất...",
    "Đang tối ưu hóa lộ trình...",
    "Đang chọn nhà hàng...",
    "Đang hoàn thiện lịch trình...",
  ];

  // Derive status from progress (0-20: index 0, 21-40: index 1, etc.)
  const statusIndex = Math.min(Math.floor(progress / 20), statuses.length - 1);
  const status = statuses[statusIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete(generateMockItinerary(trip));
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []); // Run once on mount

  return (
    <LinearGradient
      colors={["#667eea", "#764ba2"]}
      style={styles.generatingContainer}
    >
      <Text style={styles.generatingIcon}>✨</Text>
      <Text style={styles.generatingTitle}>Đang tạo chuyến đi hoàn hảo</Text>
      <Text style={styles.generatingStatus}>{status}</Text>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <Text style={styles.progressText}>{progress}%</Text>

      <View style={styles.generatingFeatures}>
        <Text style={styles.featureText}>🎯 Cá nhân hóa theo sở thích</Text>
        <Text style={styles.featureText}>💰 Tối ưu hóa cho ngân sách</Text>
        <Text style={styles.featureText}>🗺️ Lập lộ trình thông minh</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  generatingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  generatingIcon: {
    fontSize: 80,
    marginBottom: 30,
  },
  generatingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
    textAlign: "center",
  },
  generatingStatus: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 30,
  },
  progressBarContainer: {
    width: "100%",
    height: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 5,
    marginBottom: 10,
  },
  progressBar: {
    height: "100%",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  progressText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 40,
  },
});

export default GeneratingScreen;
