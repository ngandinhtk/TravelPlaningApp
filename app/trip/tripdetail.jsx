import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const TripDetailScreen = ({ trip, onBack, onEdit }) => {
  const [selectedDay, setSelectedDay] = useState(0);

  if (!trip || !trip.itinerary) return null;

  const currentDay = trip.itinerary.days[selectedDay];

  return (
    <View style={styles.itineraryContainer}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.itineraryHeader}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButtonTextWhite}>&larr; Back</Text>
        </TouchableOpacity>
        <Text style={styles.itineraryTitle}>{trip.destination}</Text>
        <TouchableOpacity onPress={onEdit}>
          <Text style={styles.editButton}>&#x270F;&#xFE0F;</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Day Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
        {trip.itinerary.days.map((day, index) => (
          <TouchableOpacity key={index} onPress={() => setSelectedDay(index)}>
            <LinearGradient
              colors={
                selectedDay === index
                  ? ['#667eea', '#764ba2']
                  : ['#ffffff', '#ffffff']
              }
              style={styles.dayTab}>
              <Text
                style={[
                  styles.dayTabText,
                  selectedDay === index && styles.dayTabTextActive,
                ]}>
                Day {day.day}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Activities for the selected day will go here */}
    </View>
  );
};

// Vui lòng thêm styles từ tệp gốc của bạn vào đây
const styles = StyleSheet.create({
  itineraryContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  itineraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  backButtonTextWhite: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  itineraryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editButton: {
    fontSize: 24,
  },
  daySelector: {
    flexGrow: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  dayTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
  },
  dayTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  dayTabTextActive: {
    color: '#FFFFFF',
  },
  daySchedule: {
    flex: 1,
    padding: 20,
  },
  dayHeader: {
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  dayDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  activityCard: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  activityTime: {
    alignItems: 'center',
    marginRight: 15,
  },
  activityTimeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
  },
  timeline: {
    flex: 1,
    width: 2,
    backgroundColor: '#E0E0E0',
    marginTop: 8,
  },
  activityContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  activityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  activityType: {
    fontSize: 12,
    color: '#666',
  },
  activityCost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  activityTips: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
  },
  tipsIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  tipsText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
  },
  daySummary: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
});

export default TripDetailScreen;