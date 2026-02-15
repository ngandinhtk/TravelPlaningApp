import { createContext, useContext, useEffect, useState } from "react";
import {
  addTrip as addTripService,
  deleteTrip as deleteTripService,
  getTrip,
  getTrips,
} from "../services/tripService";
import { useUser } from "./UserContext";

const TripContext = createContext();
export const TripProvider = ({ children }) => {
  const { user } = useUser();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState(null);

  // Fetch all trips when user changes
  useEffect(() => {
    if (user?.uid) {
      refreshTrips();
    } else {
      setTrips([]);
    }
  }, [user]);

  const refreshTrips = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await getTrips(user.uid);
      setTrips(data);
    } catch (error) {
      console.error("Failed to fetch trips", error);
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (tripData) => {
    if (!user?.uid) return;
    try {
      const newTripId = await addTripService({ ...tripData, userId: user.uid });
      await refreshTrips(); // Refresh list to show new trip
      return newTripId;
    } catch (error) {
      console.error("Error creating trip:", error);
      throw error;
    }
  };

  const removeTrip = async (tripId) => {
    try {
      await deleteTripService(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (error) {
      console.error("Error deleting trip:", error);
      throw error;
    }
  };

  // Fetch single trip details when selected
  useEffect(() => {
    if (selectedTripId) {
      const fetchTripDetails = async () => {
        try {
          const tripData = await getTrip(selectedTripId);
          setTrip(tripData);
        } catch (error) {
          console.error("Failed to fetch trip details:", error);
          setTrip(null); // Xóa trip nếu có lỗi
        }
      };
      fetchTripDetails();
    } else {
      setTrip(null); // Xóa trip khi không có ID nào được chọn
    }
  }, [selectedTripId]);

  return (
    <TripContext.Provider
      value={{
        trips,
        loading,
        refreshTrips,
        createTrip,
        removeTrip,
        selectedTripId,
        setSelectedTripId,
        trip,
        setTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

// Hook for consuming trip data
export const useTrips = () => {
  return useContext(TripContext);
};

export const useTrip = () => {
  return useContext(TripContext);
};
