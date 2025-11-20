import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import ActivityCard from './ActivityCard';

const DaySchedule = ({ day, activities }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.dayTitle}>Day {day}</Text>
      <FlatList
        data={activities}
        renderItem={({ item }) => <ActivityCard activity={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // Thêm style cho container, dayTitle, etc.
});

export default DaySchedule;