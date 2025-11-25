// src/services/authService.ts
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { User } from '../types'; // Import User interface

export const authService = {
    
  async register(email: string, password: string, fullName: string): Promise<FirebaseAuthTypes.User> {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    
    // Create user document in Firestore
    await firestore().collection('users').doc(userCredential.user.uid).set({
      email,
      fullName,
      createdAt: firestore.FieldValue.serverTimestamp(),
      preferences: {}
    });

    return userCredential.user;
  },

  async login(email: string, password: string): Promise<User> {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    return await this.getUserDetails(userCredential.user.uid);
  },

  async logout(): Promise<void> {
    return await auth().signOut();
  },

  async sendPasswordResetEmail(email: string): Promise<void> {
    return await auth().sendPasswordResetEmail(email);
  },

  async getUserDetails(uid: string): Promise<User> {
    const userDoc = await firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new Error("User data not found in Firestore.");
    }
    const userData = userDoc.data() || {}; // Ensure userData is an object
    
    // Check and provide default values if fullName or email are not strings
    const fullName = typeof userData.fullName === 'string' ? userData.fullName : 'User';
    const email = typeof userData.email === 'string' ? userData.email : 'unknown@example.com';

    return {
      id: uid,
      name: fullName,
      email: email,
      avatar: '👤', // Or from userData.avatar
    };
  }
};