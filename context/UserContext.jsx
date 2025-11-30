import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase'; // db is no longer directly needed here
import { getUserProfile } from '../services/userService'; // Import the new function

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
      // console.log("User loading state:", getUserProfile(firebaseUser.uid));
      if (firebaseUser) {
        // User is logged in, fetch their details from Firestore
        const userProfile = await getUserProfile(firebaseUser.uid);
        if (userProfile) {
          setUser({ 
            uid: firebaseUser.uid, 
            role: userProfile.role || 'user', // Mặc định là 'user' nếu không có role
            ...userProfile 
          });
        }
      } else {
        // User is logged out
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribeAuth(); // Cleanup auth listener
  }, []);

  const value = { user, isLoading };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
