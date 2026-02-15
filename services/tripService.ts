import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";
const tripsCollection = collection(db, "trips");

// Utility function to calculate trip status based on dates
export const calculateTripStatus = (trip: any): string => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Handle case where dates might be missing or different format
    if (!trip.dates) {
      return trip.status || "planning";
    }

    // Parse dates string format: "07/02/2026 - 10/02/2026"
    const dateString = trip.dates || "";
    const [startStr, endStr] = dateString.split(" - ");

    if (!startStr || !endStr) {
      return trip.status || "planning";
    }

    // Parse date strings (dd/mm/yyyy)
    const parseDateString = (dateStr: string) => {
      const [day, month, year] = dateStr.trim().split("/");
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    };

    const startDate = parseDateString(startStr);
    const endDate = parseDateString(endStr);

    // If stored status is archived, keep it
    if (trip.status === "Archived" || trip.status === "archived") {
      return "Archived";
    }

    // Determine status based on dates
    if (today > endDate) {
      return "Completed"; // Đã hoàn thành
    } else if (today >= startDate && today <= endDate) {
      return "Ongoing"; // Đang diễn ra
    } else {
      return "Upcoming"; // Sắp tới
    }
  } catch (error) {
    console.warn("Error calculating trip status:", error);
    return trip.status || "planning";
  }
};

const templatesCollection = collection(db, "templates");

// Get all trips for a specific user
export const getTrips = async (userId: any) => {
  try {
    // 1. Get trips owned by user
    const ownedQuery = query(tripsCollection, where("userId", "==", userId));
    const ownedSnapshot = await getDocs(ownedQuery);
    const ownedTrips = ownedSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 2. Get trips where user is a collaborator
    const sharedQuery = query(
      tripsCollection,
      where("collaborators", "array-contains", userId),
    );
    const sharedSnapshot = await getDocs(sharedQuery);
    const sharedTrips = sharedSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 3. Merge lists (handling potential duplicates if any)
    const allTripsMap = new Map();
    [...ownedTrips, ...sharedTrips].forEach((trip: any) =>
      allTripsMap.set(trip.id, trip),
    );
    const allTrips = Array.from(allTripsMap.values());

    // 4. Sort client-side by createdAt desc
    return allTrips.sort((a: any, b: any) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });
  } catch (error: any) {
    console.error("Error fetching trips:", error);
    return [];
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
  const tripDoc = doc(db, "trips", tripId);
  await updateDoc(tripDoc, updatedData);
};

// Delete a trip
export const deleteTrip = async (tripId: any) => {
  const tripDoc = doc(db, "trips", tripId);
  await deleteDoc(tripDoc);
};

// Get a single trip by its ID
export const getTrip = async (tripId: any): Promise<any> => {
  const tripDocRef = doc(db, "trips", tripId);
  const docSnap = await getDoc(tripDocRef);
  // console.log('Fetched trip data:', docSnap.data());
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error("No such trip found!");
  }
};

// Map a template document into a trip payload suitable for `addTrip` or `updateTrip`.
export const mapTemplateToTrip = (template: any, userId: any) => {
  const budgetMin = template?.budget?.budgetMin || template?.budgetMin || 0;
  const budgetMax = template?.budget?.budgetMax || template?.budgetMax || 0;
  const avgBudget =
    (budgetMin || 0) && (budgetMax || 0)
      ? (budgetMin + budgetMax) / 2
      : budgetMin || budgetMax || 0;

  const tripPayload: any = {
    userId,
    name: template.name || "",
    destination: template.destination || template.name || "",
    dates: template.dates || "",
    status: template.status || "planning",
    travelers: template.travelers || 1,
    budget:
      typeof avgBudget === "number" ? avgBudget : parseFloat(avgBudget) || 0,
    days: template.duration || template.days || 1,
    interests: template.highlights || [],
    notes: template.notes || "",
    itinerary: template.itinerary || [],
    tripType: template.tripType || "",
    packingList: template.packingList || [],
    createdFromTemplateId: template.id || null,
  };

  return tripPayload;
};

// get all trips form all users (for admin)

export const getAllTrips = async () => {
  try {
    const tripsCollectionRef = collection(db, "trips");

    const querySnapshot = await getDocs(tripsCollectionRef);
    const trips: any[] = [];
    querySnapshot.forEach((doc) => {
      trips.push({ id: doc.id, ...doc.data() });
    });
    return trips;
  } catch (error) {
    console.error("Error fetching all trips:", error);
    throw error;
  }
};

// Fetch a small list of templates (used on home screen for recommendations)
export const getTripTemplates = async (limitCount = 5, region?: string) => {
  try {
    const q = region
      ? query(
          templatesCollection,
          where("region", "==", region),
          limit(limitCount),
        )
      : query(templatesCollection, limit(limitCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching templates:", error);
    return [];
  }
};

// Convenience wrapper to fetch templates for a specific region
export const getTemplatesByRegion = async (region: string, limitCount = 20) => {
  return getTripTemplates(limitCount, region);
};

// Apply a template to an existing trip. This merges template fields into the trip
// while preserving trip ownership (`userId`) and `createdAt`.
// @param mergeOnly - if true, only merge itinerary without changing destination/budget/days/etc
export const applyTemplateToTrip = async (
  userId: any,
  tripId: any,
  templateId: any,
  mergeOnly: boolean = false,
) => {
  // Get template
  const templateDocRef = doc(db, "templates", templateId);
  const templateSnap = await getDoc(templateDocRef);
  if (!templateSnap.exists()) {
    throw new Error("Template not found");
  }

  // Get trip
  const tripDocRef = doc(db, "trips", tripId);
  const tripSnap = await getDoc(tripDocRef);
  if (!tripSnap.exists()) {
    throw new Error("Trip not found");
  }

  const tripData: any = tripSnap.data();
  // Ensure the user owns the trip
  if (tripData.userId !== userId) {
    throw new Error("Not authorized to modify this trip");
  }

  const templateData: any = templateSnap.data();

  // Map template to trip shape
  const mapped = mapTemplateToTrip(templateData, userId);

  // Choose which keys are safe to update on an existing trip
  let allowedUpdateKeys: string[];
  if (mergeOnly) {
    // When merging only, protect trip's original destination/budget/days info
    // Only update itinerary and packing list
    allowedUpdateKeys = ["itinerary", "packingList"];
  } else {
    // Original behavior: update all allowed fields
    // This should only be used when creating a new trip from template
    allowedUpdateKeys = [
      "destination",
      "days",
      "itinerary",
      "budget",
      "interests",
      "tripType",
      "notes",
    ];
  }
  const updateFields: any = {};
  allowedUpdateKeys.forEach((k) => {
    if (mapped[k] !== undefined) updateFields[k] = mapped[k];
  });

  updateFields.updatedAt = new Date().toISOString();

  // Update trip with mapped fields
  await updateDoc(tripDocRef, updateFields);
  return { success: true };
};

// Add a collaborator to a trip by email
export const addCollaborator = async (tripId: string, email: string) => {
  // 1. Find user by email
  const usersCollection = collection(db, "users");
  const q = query(usersCollection, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("Không tìm thấy người dùng với email này.");
  }

  const userDoc = querySnapshot.docs[0];
  const userData = userDoc.data();
  const userId = userDoc.id;

  const tripRef = doc(db, "trips", tripId);

  // 2. Add to trip
  // We store both the ID in 'collaborators' for querying
  // And 'collaboratorDetails' for display purposes
  await updateDoc(tripRef, {
    collaborators: arrayUnion(userId),
    collaboratorDetails: arrayUnion({
      uid: userId,
      email: userData.email,
      displayName: userData.displayName || userData.email,
      photoURL: userData.photoURL || null,
    }),
  });

  return { uid: userId, ...userData };
};

// Remove a collaborator
export const removeCollaborator = async (
  tripId: string,
  userId: string,
  userDetails: any,
) => {
  const tripRef = doc(db, "trips", tripId);
  await updateDoc(tripRef, {
    collaborators: arrayRemove(userId),
    collaboratorDetails: arrayRemove(userDetails),
  });
};

// --- Community & Public Trips ---

// Get public trips (Community trips)
export const getCommunityTrips = async (limitCount = 20) => {
  try {
    const q = query(
      tripsCollection,
      where("isPublic", "==", true),
      limit(limitCount),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching community trips:", error);
    return [];
  }
};

// Toggle trip visibility
export const toggleTripVisibility = async (
  tripId: string,
  isPublic: boolean,
) => {
  const tripRef = doc(db, "trips", tripId);
  await updateDoc(tripRef, { isPublic });
};

// Clone a public trip to user's personal trips
export const clonePublicTrip = async (originalTrip: any, userId: string) => {
  // Remove ID and specific user fields, reset status
  const {
    id,
    userId: oldUserId,
    createdAt,
    updatedAt,
    isPublic,
    collaborators,
    collaboratorDetails,
    ...tripData
  } = originalTrip;

  const newTrip = {
    ...tripData,
    userId,
    name: `Copy of ${tripData.destination}`,
    isPublic: false, // Cloned trips are private by default
    clonedFrom: id,
    status: "planning",
    createdAt: new Date().toISOString(),
  };
  return await addTrip(newTrip);
};
