import { useRouter } from "expo-router";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"; // Import Alert
import CustomModal from "../../components/common/Modal";
import { auth, db } from "../../services/firebase";
const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Validate email
    if (!email) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Validate password
    if (!password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      // 1. Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const authUser = userCredential.user;

      // 2. Check if user document exists in Firestore
      const userDocRef = doc(db, "users", authUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // The root layout will automatically redirect to the main app.
        router.push("/");
      } else {
        // Handle case where user exists in Auth but not in Firestore
        Alert.alert(
          "Lỗi đăng nhập",
          "Không tìm thấy dữ liệu tài khoản người dùng.",
        );
        await signOut(auth); // Sign out the user
      }
    } catch (error) {
      setErrors({ firebase: "User does not exist", error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.authContainer}
      showsVerticalScrollIndicator={false}
    >
      <CustomModal
        visible={!!errors.firebase}
        title=""
        onClose={() => setErrors({ ...errors, firebase: null })}
        onConfirm={() => setErrors({ ...errors, firebase: null })}
      >
        <Text>{errors.firebase}</Text>
      </CustomModal>

      <View style={styles.authHeader}>
        <Text style={styles.authLogo}>✈️</Text>
        <Text style={styles.authTitle}>Welcome Back</Text>
        <Text style={styles.authSubtitle}>
          Đăng nhập để tiếp tục hành trình của bạn
        </Text>
      </View>

      <View style={styles.authForm}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            value={email} // Đảm bảo giá trị hiển thị là email
            onChangeText={(text) => {
              setEmail(text); // Sửa lỗi: Cập nhật trạng thái email
              if (errors.email) {
                setErrors({ ...errors, email: null });
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />
        </View>
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => router.push("auth/forget")}
        >
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.primaryButtonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>
            &#x1F535; Đăng nhập với Google
          </Text>
        </TouchableOpacity>

        <View style={styles.signupPrompt}>
          <Text style={styles.signupPromptText}>Không có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push("auth/register")}>
            <Text style={styles.signupLink}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

// Vui lòng thêm styles từ tệp gốc của bạn vào đây
const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  authHeader: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
  },
  authLogo: {
    fontSize: 60,
    marginBottom: 20,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  authForm: {
    padding: 30,
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
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#667eea",
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: "#667eea",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    marginHorizontal: 15,
    color: "#999",
    fontSize: 14,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  socialButtonText: {
    fontSize: 16,
    color: "#1A1A1A",
  },
  signupPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  signupPromptText: {
    color: "#666",
    fontSize: 14,
  },
  signupLink: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    marginTop: -8,
  },
});

export default LoginScreen;
