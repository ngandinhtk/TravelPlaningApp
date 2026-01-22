import { Trip } from "../types";
import { getTrip, updateTrip } from "./tripService";

/**
 * Creates initial itineraries based on destinations and days.
 * Each destination gets assigned to specific days based on the total duration.
 *
 * @param destinations Array of destination names
 * @param days Total number of days for the trip
 * @returns Array of itinerary day objects with destination information
 */
export const createInitialItineraries = (
  destinations: string[],
  days: number,
): any[] => {
  if (destinations.length === 0 || days <= 0) {
    return [];
  }

  const itinerary: any[] = [];
  const daysPerDestination = Math.ceil(days / destinations.length);

  // Create a day object for each day in the trip
  for (let i = 0; i < days; i++) {
    const destinationIndex = Math.floor(i / daysPerDestination);
    const currentDestination =
      destinations[destinationIndex] || destinations[destinations.length - 1];

    const dayNumber = i + 1;
    const dayInDestination = (i % daysPerDestination) + 1;

    itinerary.push({
      day: dayNumber,
      destination: currentDestination,
      dayInDestination: dayInDestination,
      activities: [],
      notes: "",
    });
  }

  return itinerary;
};

/**
 * Adds a new activity to a specific day in a trip's itinerary.
 *
 * @param tripId The ID of the trip.
 * @param dayIndex The index of the day to add the activity to.
 * @param activityData The activity object to add.
 * @returns The updated itinerary array.
 */
export const addActivityToDay = async (
  tripId: string,
  dayIndex: number,
  activityData: any,
) => {
  const trip = (await getTrip(tripId)) as Trip;
  if (!trip) throw new Error("Trip not found");

  // Deep copy to avoid mutation issues
  const newItinerary = JSON.parse(JSON.stringify(trip.itinerary || []));

  // Ensure the day object and its activities array exist
  if (!newItinerary[dayIndex]) {
    throw new Error(`Day at index ${dayIndex} does not exist.`);
  }
  if (!newItinerary[dayIndex].activities) {
    newItinerary[dayIndex].activities = [];
  }

  newItinerary[dayIndex].activities.push(activityData);

  await updateTrip(tripId, { itinerary: newItinerary });
  return newItinerary;
};

/**
 * Updates an existing activity in a specific day of a trip's itinerary.
 *
 * @param tripId The ID of the trip.
 * @param dayIndex The index of the day.
 * @param activityIndex The index of the activity to update.
 * @param activityData The new activity data.
 * @returns The updated itinerary array.
 */
export const updateActivityInDay = async (
  tripId: string,
  dayIndex: number,
  activityIndex: number,
  activityData: any,
) => {
  const trip = (await getTrip(tripId)) as Trip;
  if (!trip) throw new Error("Trip not found");

  const newItinerary = JSON.parse(JSON.stringify(trip.itinerary || []));

  if (!newItinerary[dayIndex]?.activities?.[activityIndex]) {
    throw new Error(
      `Activity at index ${activityIndex} in day ${dayIndex} not found.`,
    );
  }

  newItinerary[dayIndex].activities[activityIndex] = activityData;

  await updateTrip(tripId, { itinerary: newItinerary });
  return newItinerary;
};

/**
 * Deletes an activity from a specific day in a trip's itinerary.
 *
 * @param tripId The ID of the trip.
 * @param dayIndex The index of the day.
 * @param activityIndex The index of the activity to delete.
 * @returns The updated itinerary array.
 */
export const deleteActivityFromDay = async (
  tripId: string,
  dayIndex: number,
  activityIndex: number,
) => {
  const trip = (await getTrip(tripId)) as Trip;
  if (!trip) throw new Error("Trip not found");

  const newItinerary = JSON.parse(JSON.stringify(trip.itinerary || []));

  if (!newItinerary[dayIndex]?.activities?.[activityIndex]) {
    throw new Error(
      `Activity at index ${activityIndex} in day ${dayIndex} not found.`,
    );
  }

  newItinerary[dayIndex].activities.splice(activityIndex, 1);

  await updateTrip(tripId, { itinerary: newItinerary });
  return newItinerary;
};
