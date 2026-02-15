import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Navigation } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
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

  // Default coordinates (e.g., Ho Chi Minh City) if place doesn't have them
  const initialRegion = {
    latitude: place.latitude || 10.7769,
    longitude: place.longitude || 106.7009,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const handleGetDirections = () => {
    const lat = place.latitude || 10.7769;
    const lng = place.longitude || 106.7009;
    const label = place.name;

    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${lat},${lng}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latLng}`,
    });

    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết địa điểm</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.mapContainer}>
          <MapView style={styles.map} initialRegion={initialRegion}>
            <Marker
              coordinate={{
                latitude: initialRegion.latitude,
                longitude: initialRegion.longitude,
              }}
              title={place.name}
              description={place.address}
            />
          </MapView>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{place.name}</Text>
          {place.category && (
            <Text style={styles.category}>{place.category}</Text>
          )}

          <TouchableOpacity
            style={styles.directionButton}
            onPress={handleGetDirections}
          >
            <Navigation size={20} color="#fff" />
            <Text style={styles.directionText}>Chỉ đường</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>{place.description}</Text>

          <Text style={styles.sectionTitle}>Địa chỉ</Text>
          <Text style={styles.address}>
            {place.address || "Chưa cập nhật địa chỉ"}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  content: { flex: 1 },
  mapContainer: {
    height: 250,
    width: "100%",
    marginBottom: 20,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: { fontSize: 26, fontWeight: "bold", color: "#333", marginBottom: 4 },
  category: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "600",
    marginBottom: 16,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  description: { fontSize: 16, color: "#555", lineHeight: 24 },
  address: { fontSize: 16, color: "#555", fontStyle: "italic" },
  directionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#667eea",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  directionText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
});
