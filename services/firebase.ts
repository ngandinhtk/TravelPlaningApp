// src/firebase.ts
import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

const firebaseConfig = {
  version: "2",
  projectNumber: "106371139318",
  projectId: "travalaapp-8bd4c",
  appId: "1:106371139318:web:f7733d51c4b8e2bd9cced7",
  realtimeDatabaseInstanceUri:
    "https://travalaapp-8bd4c-default-rtdb.europe-west1.firebasedatabase.app",
  realtimeDatabaseUrl: "",
  storageBucket: "travalaapp-8bd4c.firebasestorage.app",
  locationId: "",
  apiKey: "AIzaSyAnV5vn12s1AfVMRCyW5b4LrQUIBOxOLes",
  authDomain: "travalaapp-8bd4c.firebaseapp.com",
  messagingSenderId: "106371139318",
  measurementId: "G-EPCSPXS2MR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Set persistence only for web platform
if (Platform.OS === "web") {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.warn("Failed to set persistence:", error);
  });
}

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
