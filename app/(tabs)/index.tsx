import { auth, db } from '@/services/firebase';
import { User } from '@/types';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import HomeScreen from '../../app/home/home';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<any[] | null>(null);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is logged in, fetch their details from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          // Set a default avatar if none exists
          if (!userData.avatar) {
            userData.avatar = '✈️';
          }
          setUser(userData);

          // Now that we have the user, fetch their trips
          const tripsQuery = query(collection(db, 'trips'), where('userId', '==', firebaseUser.uid));
          const unsubscribeTrips = onSnapshot(tripsQuery, (snapshot) => {
            const tripsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTrips(tripsData);
          });
          return () => unsubscribeTrips(); // Cleanup trips listener
        }
      } else {
        // User is logged out
        setUser(null);
        setTrips(null);
      }
    });

    return () => unsubscribeAuth(); // Cleanup auth listener
  }, []);

  return <HomeScreen user={user} onCreateTrip={[]} onViewTrip={[]} onProfile={[]} />;
  // This component now simply renders the HomeScreen.
  // HomeScreen will be responsible for fetching its own data or receiving it via context.

}