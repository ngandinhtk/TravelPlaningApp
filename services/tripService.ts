import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { MOCK_TRIPS } from "../api/mockApi";
import { db } from '../services/firebase';
const tripsCollection = collection(db, 'trips');

// Get all trips for a specific user
export const getTrips = async (userId : any) => {
  // const q = query(tripsCollection, where('userId', '==', userId));
  // const querySnapshot = await getDocs(q);
  // console.log('123');
  // return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  console.log(`Fetching trips for user: ${userId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_TRIPS);
    }, 1500); // Simulate 1.5 second network delay
  });
};

// Add a new trip
export const addTrip = async (tripData: any) => {
  const docRef = await addDoc(tripsCollection, {
    ...tripData,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
};

// Update an existing trip
export const updateTrip = async (tripId: any, tripData: any) => {
  const tripDoc = doc(db, 'trips', tripId);
  await updateDoc(tripDoc, tripData);
};

// Delete a trip
export const deleteTrip = async (tripId: any) => {
  const tripDoc = doc(db, 'trips', tripId);
  await deleteDoc(tripDoc);
};