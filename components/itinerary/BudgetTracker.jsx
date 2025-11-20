import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BudgetTracker = ({ budget, spent }) => {
  const remaining = budget - spent;

  return (
    <View style={styles.container}>
      <Text>Budget: ${budget}</Text>
      <Text>Spent: ${spent}</Text>
      <Text>Remaining: ${remaining}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
});

export default BudgetTracker;