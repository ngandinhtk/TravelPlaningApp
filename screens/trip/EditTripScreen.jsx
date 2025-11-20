import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EditTripScreen = ({ trip, onBack }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Trip: {trip?.destination}</Text>
      {/* Thêm các trường để chỉnh sửa chuyến đi ở đây */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1A1A1A',
  },
});

export default EditTripScreen;