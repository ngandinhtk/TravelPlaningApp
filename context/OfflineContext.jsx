import NetInfo from "@react-native-community/netinfo";
import { createContext, useContext, useEffect, useState } from "react";
import { offlineService } from "../services/offlineService";

const OfflineContext = createContext();

export const OfflineProvider = ({ children }) => {
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected;
      setIsOffline(offline);

      if (!offline) {
        // Trigger sync if we just came back online
        syncData();
      }
    });

    return () => unsubscribe();
  }, []);

  const syncData = async () => {
    setIsSyncing(true);
    try {
      const queue = await offlineService.getAndClearSyncQueue();
      if (queue.length > 0) {
        console.log(`Syncing ${queue.length} offline actions...`);
        // Loop through queue and call respective services (TripService, BudgetService)
        // based on action.type.
        // Example: if (action.type === 'UPDATE_BUDGET') budgetService.update(...)
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const downloadTrip = async (trip) => {
    // Save trip details
    await offlineService.saveTripForOffline(trip);

    // If trip has associated places in the itinerary, save them too
    if (trip.itinerary) {
      // Mock logic: iterate itinerary items and save places
      // trip.itinerary.forEach(day => day.activities.forEach(act => offlineService.savePlaceForOffline(act.place)));
    }

    console.log(`Trip ${trip.destination} downloaded.`);
  };

  return (
    <OfflineContext.Provider
      value={{
        isOffline,
        isSyncing,
        downloadTrip,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => useContext(OfflineContext);
