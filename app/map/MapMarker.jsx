import { StyleSheet, Text, View } from "react-native";
import { Callout, Marker } from "react-native-maps";

export const MapMarker = ({ place, onPress, onCalloutPress }) => {
  return (
    <Marker
      coordinate={{
        latitude: place.latitude,
        longitude: place.longitude,
      }}
      onPress={onPress ? () => onPress(place) : undefined}
      pinColor={place.category === "food" ? "orange" : "red"}
      // This event is triggered when the user presses on the callout bubble.
      onCalloutPress={onCalloutPress ? () => onCalloutPress(place) : undefined}
    >
      <Callout>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>{place.name}</Text>
          <Text style={styles.calloutDescription}>{place.category}</Text>
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  calloutContainer: {
    minWidth: 100,
    alignItems: "center",
    padding: 5,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 2,
  },
  calloutDescription: {
    fontSize: 12,
    color: "#666",
    textTransform: "capitalize",
  },
});
