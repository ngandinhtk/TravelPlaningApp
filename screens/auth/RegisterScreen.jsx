import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomModal from '../../components/common/Modal';
import defaultAvatar from '../../lib/avatar-default.svg';
import { auth, db } from '../../services/firebase';


const RegisterScreen = ({ onRegister, onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!name) newErrors.name = 'Họ và tên không được để trống';

    if (!email) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister =  async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({}); // Clear previous errors
    try {
      // 1. Create user in Firebase Auth using state variables
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 2. Create user document in 'users' collection
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: name,
        email: email.trim().toLowerCase(), // Store email consistently
        photoURL: defaultAvatar,
        createdAt: new Date().toISOString(),
        role: 'user',
      });

      // 3. Create user settings document in 'userSettings' collection
      await setDoc(doc(db, 'userSettings', user.uid), {
        theme: 'light',
        notificationsEnabled: true,
      });

      // Sign out the user immediately so they are redirected to the login screen
      await signOut(auth);

      // 4. Call the onRegister callback to complete the process
      setRegistrationSuccess(true);

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setErrors({
          firebase: 'Địa chỉ email này đã được sử dụng bởi một tài khoản khác.',
        });
      } else {
        setErrors({ firebase: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.authContainer} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

        <CustomModal
          visible={!!errors.firebase}
          title=""
          onClose={() => setErrors({ ...errors, firebase: null })}
          onConfirm={() => setErrors({ ...errors, firebase: null })}
        >
          <Text>{errors.firebase}</Text>
        </CustomModal>

        <CustomModal
          visible={registrationSuccess}
          title=""
          onClose={onBack} // Xử lý khi nhấn nút 'X' hoặc 'Huỷ'
          onConfirm={onBack} // Xử lý khi nhấn nút 'Đồng ý'
        >
          <Text>Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.</Text>
      </CustomModal>

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
              if (errors.name) {
                setErrors({ ...errors, name: null });
              }
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
            placeholder="Min. 8 characters"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) {
                setErrors({ ...errors, password: null });
              }
            }}
            secureTextEntry
            placeholderTextColor="#999"
          />
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.primaryButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Vui lòng thêm styles từ tệp gốc của bạn vào đây
const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 20,
  },
  backButtonText: {
    color: '#667eea',
    fontSize: 16,
  },
  authHeader: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  authLogo: {
    fontSize: 60,
    marginBottom: 20,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  authForm: {
    paddingHorizontal: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  primaryButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    marginTop: -10,
  },
});

export default RegisterScreen;