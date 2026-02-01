import AsyncStorage from "@react-native-async-storage/async-storage";

// Keys for local storage
const STORAGE_KEYS = {
  OFFLINE_TRIPS: "offline_trips",
  OFFLINE_PLACES: "offline_places",
  SYNC_QUEUE: "sync_queue",
  MAP_TILES: "offline_map_regions", // Placeholder for map tile caching
};

export const offlineService = {
  /**
   * Save a full trip details for offline usage.
   * This includes itinerary, budget, and checklist.
   */
  async saveTripForOffline(trip: any) {
    try {
      // 1. Get existing offline trips
      const existingJson = await AsyncStorage.getItem(
        STORAGE_KEYS.OFFLINE_TRIPS,
      );
      const trips = existingJson ? JSON.parse(existingJson) : {};

      // 2. Update or add the trip with a timestamp
      trips[trip.id] = {
        ...trip,
        lastDownloaded: new Date().toISOString(),
      };

      // 3. Save back to storage
      await AsyncStorage.setItem(
        STORAGE_KEYS.OFFLINE_TRIPS,
        JSON.stringify(trips),
      );
      return true;
    } catch (error) {
      console.error("Failed to save trip offline:", error);
      return false;
    }
  },

  /**
   * Retrieve a trip from local storage when offline.
   */
  async getOfflineTrip(tripId: string) {
    try {
      const existingJson = await AsyncStorage.getItem(
        STORAGE_KEYS.OFFLINE_TRIPS,
      );
      const trips = existingJson ? JSON.parse(existingJson) : {};
      return trips[tripId] || null;
    } catch (error) {
      console.error("Failed to get offline trip:", error);
      return null;
    }
  },

  /**
   * Save place details (description, location, etc.) for offline usage.
   */
  async savePlaceForOffline(place: any) {
    try {
      const existingJson = await AsyncStorage.getItem(
        STORAGE_KEYS.OFFLINE_PLACES,
      );
      const places = existingJson ? JSON.parse(existingJson) : {};

      places[place.id] = place;

      await AsyncStorage.setItem(
        STORAGE_KEYS.OFFLINE_PLACES,
        JSON.stringify(places),
      );
    } catch (error) {
      console.error("Failed to save place offline:", error);
    }
  },

  /**
   * Queue an action to be synced when online.
   * Example: { type: 'UPDATE_BUDGET', payload: { tripId: '123', amount: 500 } }
   */
  async queueSyncAction(action: any) {
    try {
      const existingJson = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      const queue = existingJson ? JSON.parse(existingJson) : [];

      queue.push({
        ...action,
        id: Date.now().toString(), // Simple unique ID
        timestamp: new Date().toISOString(),
      });

      await AsyncStorage.setItem(
        STORAGE_KEYS.SYNC_QUEUE,
        JSON.stringify(queue),
      );
    } catch (error) {
      console.error("Failed to queue sync action:", error);
    }
  },

  /**
   * Get and clear the sync queue (used when connection is restored).
   */
  async getAndClearSyncQueue() {
    try {
      const existingJson = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      const queue = existingJson ? JSON.parse(existingJson) : [];
      if (queue.length > 0) {
        await AsyncStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
      }
      return queue;
    } catch (error) {
      return [];
    }
  },
};
