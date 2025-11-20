import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const TripCard = ({ trip, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Image source={{ uri: trip.imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.destination}>{trip.destination}</Text>
        <Text style={styles.dates}>{trip.dates}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    backgroundColor: '#fff',
    marginBottom: 20,
    overflow: 'hidden',
  },
  // Thêm các style khác
});

export default TripCard;