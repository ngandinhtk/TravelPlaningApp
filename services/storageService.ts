import AsyncStorage from "@react-native-async-storage/async-storage";

// Keys for different data entities to ensure consistency
export const STORAGE_KEYS = {
  TRIPS: "@travel_app_trips",
  PLACES: "@travel_app_places", // User manually added places
  SETTINGS: "@travel_app_settings",
  USER_PROFILE: "@travel_app_user_profile",
  TEMPLATES: "@travel_app_templates", // Downloaded or custom templates
};

/**
 * Generic save function to persist data to local storage.
 * @param key - The unique key for the data (use STORAGE_KEYS).
 * @param value - The data object to store (will be stringified).
 */
export const storeData = async (key: string, value: any): Promise<boolean> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (e) {
    console.error(`[Storage] Error storing data for key: ${key}`, e);
    return false;
  }
};

/**
 * Generic get function to retrieve data from local storage.
 * @param key - The unique key for the data.
 * @returns The parsed data object or null if not found.
 */
export const getData = async (key: string): Promise<any | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error(`[Storage] Error reading data for key: ${key}`, e);
    return null;
  }
};

/**
 * Generic remove function to delete specific data.
 * @param key - The unique key for the data to remove.
 */
export const removeData = async (key: string): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error(`[Storage] Error removing data for key: ${key}`, e);
    return false;
  }
};

/**
 * Clear all app data (useful for "Reset App" feature or debugging).
 */
export const clearAll = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
    console.log("[Storage] All data cleared.");
  } catch (e) {
    console.error("[Storage] Error clearing all storage", e);
  }
};
