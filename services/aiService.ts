// src/services/authService.js
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const authService = {
  async register(email:string, password:string, fullName:string) {
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

  async login(email: string, password:string) {
    return await auth().signInWithEmailAndPassword(email, password);
  },

  async logout() {
    return await auth().signOut();
  },

  getCurrentUser() {
    return auth().currentUser;
  }
};