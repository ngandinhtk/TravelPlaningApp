import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const TripMap = ({ places = [] }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (places.length > 0 && mapRef.current) {
      // Filter places that have valid location data
      const coordinates = places
        .filter(p => p.location && p.location.lat && p.location.lng)
        .map(p => ({
          latitude: p.location.lat,
          longitude: p.location.lng,
        }));

      // Fit the map to show all markers
      if (coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [places]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
      >
        {places.map((place, index) => {
          if (!place.location || !place.location.lat || !place.location.lng) return null;
          
          return (
            <Marker
              key={place.id || `place-${index}`}
              coordinate={{
                latitude: place.location.lat,
                longitude: place.location.lng,
              }}
              title={place.name}
              description={place.address}
            />
          );
        })}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 250,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default TripMap;