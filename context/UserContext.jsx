import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { MOCK_USER } from '../api/mockApi';
import { auth, db } from '../services/firebase';

// 1. Create the context
const UserContext = createContext();

// 2. Create a custom hook for easy consumption
export const useUser = () => {
  return useContext(UserContext);
};

// 3. Create the Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is logged in, fetch their details from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ uid: firebaseUser.uid, ...userDoc.data() });
        }
      } else {
        // User is logged out
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribeAuth(); // Cleanup auth listener
  }, []);

  // Use the mock user as a fallback during development if the user is null
  const userToProvide = user || MOCK_USER;

  const value = { user: userToProvide, isLoading };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
