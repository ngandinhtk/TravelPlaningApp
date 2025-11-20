import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ActivityCard = ({ activity }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.time}>{activity.time}</Text>
      <View style={styles.details}>
        <Text style={styles.title}>{activity.title}</Text>
        <Text style={styles.description}>{activity.description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    flexDirection: 'row',
  },
  // Thêm các style khác nếu cần
});

export default ActivityCard;