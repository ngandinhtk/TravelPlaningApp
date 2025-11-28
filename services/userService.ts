import { deleteUser as firebaseDeleteUser } from 'firebase/auth'; // Alias to avoid name collision
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase'; // Import auth and db from your firebase config

/**
 * Fetches all user documents from the 'users' collection.
 * @returns {Array} An array of user data objects.
 */

export const getAllUsers = async () => {
  try {
    const usersCollectionRef = collection(db, 'users');
    
    const querySnapshot = await getDocs(usersCollectionRef);
    const users: any[] = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

/**
 * Creates a new user document in the 'users' collection.
 * @param {string} uid The Firebase Auth User ID.
 * @param {object} userData The data to store for the user (e.g., displayName, email, photoURL).
 */
export const createUserProfile = async (uid: any, userData: any) => {
  try {
    await setDoc(doc(db, 'users', uid), userData);
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

/**
 * Updates an existing user document in the 'users' collection.
 * @param {string} uid The Firebase Auth User ID.
 * @param {object} newData The data to update.
 */
export const updateUserProfile = async (uid: any, newData: any) => {
  try {
    await updateDoc(doc(db, 'users', uid), newData);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Deletes a user document from the 'users' collection and optionally from Firebase Auth.
 * @param {string} uid The Firebase Auth User ID.
 * @param {boolean} deleteFirebaseAuthUser Also delete the user from Firebase Authentication.
 */
export const deleteUserAccount = async (uid: any, deleteFirebaseAuthUser = false) => {
  try {
    // Delete from Firestore
    await deleteDoc(doc(db, 'users', uid));

    // Optionally delete from Firebase Auth
    if (deleteFirebaseAuthUser) {
      const user = auth.currentUser;
      if (user && user.uid === uid) {
        await firebaseDeleteUser(user);
      } else {
        console.warn("Cannot delete Firebase Auth user: current user does not match or is not logged in.");
      }
    }
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
};

// You might also want a function to get a single user's profile by UID
export const getUserProfile = async (uid: any) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};