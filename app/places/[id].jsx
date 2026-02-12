import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { placeService } from "../../services/placeService";

export default function PlaceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // In a real app, you'd fetch a single place by ID.
      // Here, we'll find it in our mock service for demonstration.
      placeService.getAllPlaces().then((allPlaces) => {
        const foundPlace = allPlaces.find((p) => p.id === id);
        setPlace(foundPlace);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  if (!place) {
    return <Text>Place not found!</Text>;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text>← Back to Map</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{place.name}</Text>
      <Text style={styles.description}>{place.description}</Text>
      <Text style={styles.address}>Address: {place.address}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  backButton: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  description: { fontSize: 16, color: "#666", marginBottom: 10 },
  address: { fontSize: 14, color: "#333", fontStyle: "italic" },
});
