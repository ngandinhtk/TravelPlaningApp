import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import BackButton from '../../components/common/BackButton';
import { getAllTrips } from '../../services/tripService';

const ManageTripsScreen = () => {
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const fetchedTrips = await getAllTrips();
        setTrips(fetchedTrips);

      } catch (error) {
        console.error("Failed to fetch all trips:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [trips]);

  const renderTripItem = ({ item }) => (
    
    <View style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <Text style={styles.tripDestination}>{item.destination}</Text>
        <Text style={styles.tripStatus}>{item.status}</Text>
      </View>
      <Text style={styles.tripDates}>{item.dates}</Text>
      <Text style={styles.tripUser}>User ID: {item.userId}</Text>
    </View>
  );
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Manage All Trips</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>
      <FlatList
        data={trips}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        onRefresh={() => { /* TODO: Refresh logic */ }}
        refreshing={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  backButton: { padding: 5 },
  backButtonText: { color: '#FFF', fontSize: 24 },
  listContainer: { padding: 20 },
  tripCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tripDestination: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tripStatus: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  tripDates: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  tripUser: {
    fontSize: 12,
    color: '#aaa',
  },
});
export default ManageTripsScreen;
    