import { useLocalSearchParams, useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BackButton from "../../components/common/BackButton";
import CustomModal from "../../components/common/Modal";
import { auth, db } from "../../services/firebase";

const ForgetPasswordScreen = () => {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const params = useLocalSearchParams();
  const [email, setEmail] = useState(params?.email || "");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email không được để trống";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Email không hợp lệ";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendResetLink = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      setErrors({});

      // Kiểm tra xem email có tồn tại trong collection 'users' của Firestore không
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("email", "==", email.trim().toLowerCase()),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setErrors({
          firebase: "Không tìm thấy người dùng với địa chỉ email này.",
        });
        return;
      }

      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(
        "Kiểm tra Email của bạn",
        "Một liên kết để đặt lại mật khẩu đã được gửi đến địa chỉ email của bạn.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error) {
      let errorMessage = "Đã xảy ra lỗi. Vui lòng thử lại.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "Không tìm thấy người dùng với địa chỉ email này.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Địa chỉ email không hợp lệ.";
      }
      setErrors({ firebase: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomModal
        visible={!!errors.firebase}
        title="Notification"
        onClose={() => setErrors({ ...errors, firebase: null })}
        onConfirm={() => setErrors({ ...errors, firebase: null })}
      >
        <Text>{errors.firebase}</Text>
      </CustomModal>

      <BackButton />

      <View style={styles.header}>
        <Text style={styles.title}>Quên mật khẩu</Text>
        <Text style={styles.subtitle}>
          Nhập email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại
          mật khẩu.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: null });
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleSendResetLink}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.primaryButtonText}>Gửi liên kết</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 30 },
  backButton: { paddingBottom: 40 },
  backButtonText: { color: "#667eea", fontSize: 16, fontWeight: "600" },
  header: { alignItems: "center", paddingBottom: 40 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: "#666", textAlign: "center" },
  form: {},
  inputGroup: { marginBottom: 20 },
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
  },
  primaryButton: {
    backgroundColor: "#667eea",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "600" },
  buttonDisabled: { opacity: 0.6 },
  errorText: {
    color: "red",
    marginBottom: 10,
    marginTop: -10,
  },
});

export default ForgetPasswordScreen;
