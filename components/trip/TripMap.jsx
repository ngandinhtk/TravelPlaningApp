import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const TripMap = ({ region, markers }) => {
  return (
    <MapView style={styles.map} initialRegion={region}>
      {markers && markers.map((marker, index) => <Marker key={index} coordinate={marker.coordinate} title={marker.title} />)}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default TripMap;