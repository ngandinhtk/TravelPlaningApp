import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BackButton from '../../components/common/BackButton';
import CustomModal from '../../components/common/Modal';
import { auth, db } from '../../services/firebase'; // Import cả auth và db

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordconfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();
  const validateForm = () => {
    const newErrors = {};
    if (!name) newErrors.name = 'Họ và tên không được để trống';
    if (!email) newErrors.email = 'Email không được để trống';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email không hợp lệ';
    if (!password) newErrors.password = 'Mật khẩu không được để trống';
    if (!passwordconfirm) newErrors.passwordconfirm = 'Mật khẩu không được để trống';
    if (password !== passwordconfirm) newErrors.passwordconfirm = 'Mật khẩu không khớp';
    else if (password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: name,
        email: email.trim().toLowerCase(),
        photoURL: '', // Lưu một chuỗi rỗng thay vì đối tượng SVG
        createdAt: new Date().toISOString(),
        role: 'user',
      });

      // await setDoc(doc(db, 'userSettings', user.uid), {
      //   theme: 'light',
      //   notificationsEnabled: true,
      // });

      // Điều hướng đến trang chủ sau khi đăng ký thành công
      router.push('/');

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setErrors({ firebase: 'Địa chỉ email này đã được sử dụng.' });
      } else {
        setErrors({ firebase: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.authContainer} showsVerticalScrollIndicator={false}>
      <CustomModal
        visible={!!errors.firebase}
        title=""
        onClose={() => setErrors({ ...errors, firebase: null })}
        onConfirm={() => setErrors({ ...errors, firebase: null })}
      >
        <Text>{errors.firebase}</Text>
      </CustomModal>

      <BackButton style={{ marginTop: 40, marginLeft: 20 }} />

      <View style={styles.authHeader}>
        <Text style={styles.authLogo}>✈️</Text>
        <Text style={styles.authTitle}>Create Account</Text>
        <Text style={styles.authSubtitle}>Start your travel adventure</Text>
      </View>

      <View style={styles.authForm}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors({ ...errors, name: null });
            }}
            placeholderTextColor="#999"
          />
        </View>
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

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

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Min. 6 characters"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: null });
            }}
            secureTextEntry
            placeholderTextColor="#999"
          />
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

         <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password Confirm</Text>
          <TextInput
            style={styles.input}
            placeholder="Min. 6 characters"
            value={passwordconfirm}
            onChangeText={(text) => {
              setPasswordConfirm(text);
              if (errors.passwordconfirm) setErrors({ ...errors, passwordconfirm: null });
            }}
            secureTextEntry
            placeholderTextColor="#999"
          />
        </View>
        {errors.passwordconfirm && <Text style={styles.errorText}>{errors.passwordconfirm}</Text>}

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryButtonText}>Create Account</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  authContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  authHeader: { alignItems: 'center', paddingTop: 0, paddingBottom: 40 },
  authLogo: { fontSize: 60, marginBottom: 20 },
  authTitle: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },
  authSubtitle: { fontSize: 16, color: '#666' },
  authForm: { paddingHorizontal: 30 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, backgroundColor: '#F8F9FA' },
  primaryButton: { backgroundColor: '#667eea', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
  errorText: { color: 'red', marginBottom: 10, marginTop: -10 },
});

export default RegisterScreen;