// src/services/authService.ts
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const authService = {
    
  async register(email: string, password: string, fullName: string): Promise<FirebaseAuthTypes.User> {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    
    // Tạo user document trong Firestore
    await firestore().collection('users').doc(userCredential.user.uid).set({
      email,
      fullName,
      createdAt: firestore.FieldValue.serverTimestamp(),
      preferences: {}
    });
    
    return userCredential.user;
  },

  async login(email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> {
    return await auth().signInWithEmailAndPassword(email, password);
  },

  async logout(): Promise<void> {
    return await auth().signOut();
  },

  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  }
};