import React, { useState } from 'react';
import { View, Button } from 'react-native';
import Input from '../common/Input';

const TripForm = ({ onSubmit }) => {
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');

  const handleSubmit = () => {
    onSubmit({ destination, dates });
  };

  return (
    <View>
      <Input
        label="Destination"
        value={destination}
        onChangeText={setDestination}
        placeholder="e.g., Paris"
      />
      <Input label="Dates" value={dates} onChangeText={setDates} placeholder="e.g., June 1 - June 10" />
      <Button title="Create Trip" onPress={handleSubmit} />
    </View>
  );
};

export default TripForm;