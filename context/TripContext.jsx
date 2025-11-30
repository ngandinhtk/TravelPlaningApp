import { createContext, useContext, useEffect, useState } from 'react';
import { getTrip } from '../services/tripService';

const TripContext = createContext();
export const TripProvider = ({ children }) => {
  const [trip, setTrip] = useState(null)
  const [selectedTripId, setSelectedTripId] = useState(null);

  useEffect(() => {
    if (selectedTripId) {
      const fetchTripDetails = async () => {
        try {
          const tripData = await getTrip(selectedTripId);
          setTrip(tripData);
        } catch (error) {
          console.error('Failed to fetch trip details:', error);
          setTrip(null); // Xóa trip nếu có lỗi
        }
      };
      fetchTripDetails();
    } else {
      setTrip(null); // Xóa trip khi không có ID nào được chọn
    }
    
  }, [selectedTripId]);

  return (
    <TripContext.Provider value={{ selectedTripId, setSelectedTripId, trip, setTrip }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  return useContext(TripContext);
};