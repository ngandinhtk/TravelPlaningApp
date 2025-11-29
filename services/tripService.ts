import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../services/firebase';
const tripsCollection = collection(db, 'trips');

// Get all trips for a specific user
export const getTrips = async (userId: any) => {
  try {
    // Tạo một truy vấn để lấy các chuyến đi có 'userId' khớp và sắp xếp theo ngày tạo mới nhất
    const q = query(tripsCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    // Trả về một mảng các chuyến đi, bao gồm cả ID của document  
    return querySnapshot.docs.map((doc) => 
      ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    // Nếu truy vấn orderBy thất bại (có thể do không có index), fetch tất cả và sắp xếp phía client
    console.warn('Error with orderBy query, sorting client-side:', error.message);
    const q = query(tripsCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const trips = querySnapshot.docs.map((doc) => 
      ({ id: doc.id, ...doc.data() }));
    
    // Sắp xếp theo createdAt (mới nhất trước), nếu không có thì sắp xếp theo id
    return trips.sort((a: any, b: any) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });
  }
};

// Add a new trip
export const addTrip = async (tripData: any) => {
  const docRef = await addDoc(tripsCollection, {
    ...tripData,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
};

// Update a trip
export const updateTrip = async (tripId: any, updatedData: any) => {
  const tripDoc = doc(db, 'trips', tripId);
  await updateDoc(tripDoc, updatedData);
};

// Delete a trip
export const deleteTrip = async (tripId: any) => {
  const tripDoc = doc(db, 'trips', tripId);
  await deleteDoc(tripDoc);
};  