export interface Place {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: "attraction" | "food" | "hotel" | "culture";
  rating: number;
  address: string;
  imageUrl?: string;
}

// Mock data for Vietnam (Lite MVP - No API Cost)
const MOCK_PLACES: Place[] = [
  {
    id: "1",
    name: "Hoan Kiem Lake",
    description: "The historical heart of Hanoi, famous for its turtle legend.",
    latitude: 21.0285,
    longitude: 105.8542,
    category: "attraction",
    rating: 4.8,
    address: "Hang Trong, Hoan Kiem, Hanoi",
  },
  {
    id: "2",
    name: "Dragon Bridge",
    description: "Iconic bridge in Da Nang that breathes fire on weekends.",
    latitude: 16.0611,
    longitude: 108.227,
    category: "attraction",
    rating: 4.7,
    address: "Nguyen Van Linh, Phuoc Ninh, Da Nang",
  },
  {
    id: "3",
    name: "Ben Thanh Market",
    description: "Bustling market in Ho Chi Minh City for food and souvenirs.",
    latitude: 10.7721,
    longitude: 106.6983,
    category: "culture",
    rating: 4.5,
    address: "Le Loi, Ben Thanh, District 1, HCMC",
  },
  {
    id: "4",
    name: "Hoi An Ancient Town",
    description:
      "Exceptionally well-preserved example of a South-East Asian trading port.",
    latitude: 15.8801,
    longitude: 108.338,
    category: "culture",
    rating: 4.9,
    address: "Hoi An, Quang Nam",
  },
];

export const placeService = {
  /**
   * Get all places (Simulates a local database query)
   */
  getAllPlaces: async (): Promise<Place[]> => {
    // Simulate slight delay for realism
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_PLACES;
  },

  /**
   * Get places by category
   */
  getPlacesByCategory: async (category: string): Promise<Place[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_PLACES.filter((p) => p.category === category);
  },
};
