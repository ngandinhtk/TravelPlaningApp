import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import MapView, { PROVIDER_DEFAULT } from "react-native-maps";
import { useIntelligence } from "../../context/IntelligenceContext";
import { placeService } from "../../services/placeService";
import { MapMarker } from "../map/MapMarker";

// Default view centered on Vietnam
const INITIAL_REGION = {
  latitude: 16.047079,
  longitude: 108.20623,
  latitudeDelta: 12.0,
  longitudeDelta: 6.0,
};

export default function MapScreen() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const { trackAction } = useIntelligence();
  const router = useRouter();

  useEffect(() => {
    loadPlaces();
    // Track that the user opened the map
    trackAction(
      "current_user_id",
      "map_viewed",
      "map",
      {},
      { region: "Vietnam" },
    );
  }, []);

  const loadPlaces = async () => {
    try {
      const data = await placeService.getAllPlaces();
      setPlaces(data);
    } catch (error) {
      console.error("Error loading places:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (place) => {
    // Track interest in a specific place
    trackAction(
      "current_user_id",
      "place_viewed_on_map",
      "place",
      { placeId: place.id, name: place.name, category: place.category },
      { source: "map_marker" },
    );

    // In the future, this could open a bottom sheet or navigate to details
    console.log("Marker pressed:", place.name);
  };

  const handleCalloutPress = (place) => {
    // As per COMPOUNDING_INTELLIGENCE.md, track this specific interaction
    trackAction(
      "current_user_id",
      "place_details_viewed",
      "place",
      { placeId: place.id, name: place.name },
      { source: "map_callout" },
    );

    // As per PHASE_1_ARCHITECTURE.md, navigate to the place detail screen
    // The path `places/[id].jsx` corresponds to this route.
    router.push(`/places/${place.id}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={INITIAL_REGION}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {places.map((place) => (
          <MapMarker
            key={place.id}
            place={place}
            onPress={handleMarkerPress}
            onCalloutPress={handleCalloutPress}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
