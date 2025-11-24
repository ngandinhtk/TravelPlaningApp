import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const SkeletonPlaceholder = ({ width, height, style }) => {
  const pulseAnim = new Animated.Value(0);

  useEffect(() => {
    const sharedAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 750,
          useNativeDriver: false,
        }),
      ])
    );
    sharedAnimation.start();
    return () => sharedAnimation.stop();
  }, []);

  const backgroundColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E0E0E0', '#F0F0F0'],
  });

  return <Animated.View style={[{ width, height, backgroundColor, borderRadius: 4 }, style]} />;
};

const HomeScreen = ({ onCreateTrip, onViewTrip, onProfile }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);

  return (
    <View style={styles.homeContainer}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.homeHeader}>
        {isLoading ? <HeaderSkeleton /> : <HeaderContent user={user} onProfile={onProfile} />}
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search destinations..."
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        {isLoading ? <StatsSkeleton /> : <StatsContent trips={trips} />}
      </View>

      {/* Create Trip Button */}
      <TouchableOpacity onPress={onCreateTrip}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.createTripButton}>
          <Text style={styles.createTripIcon}>✨</Text>
          <Text style={styles.createTripText}>Create New Trip with AI</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Trips List */}
      <ScrollView style={styles.tripsSection} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Trips</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? <TripsSkeleton /> : <TripsContent trips={trips} onViewTrip={onViewTrip} />}

        {/* Recommended Destinations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Destinations</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendingScroll}>
          {[
            { emoji: '🗼', name: 'Paris', color: '#FF6B6B' },
            { emoji: '🗽', name: 'New York', color: '#4ECDC4' },
            { emoji: '🏯', name: 'Tokyo', color: '#95E1D3' },
            { emoji: '🏖️', name: 'Bali', color: '#F38181' },
          ].map((dest, index) => (
            <TouchableOpacity key={index}>
              <LinearGradient colors={[dest.color, dest.color + 'CC']} style={styles.trendingCard}>
                <Text style={styles.trendingEmoji}>{dest.emoji}</Text>
                <Text style={styles.trendingText}>{dest.name}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {/* ... navigation items ... */}
      </View>
    </View>
  );
};

const HeaderSkeleton = () => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
    <View>
      <SkeletonPlaceholder width={180} height={28} style={{ marginBottom: 8 }} />
      <SkeletonPlaceholder width={120} height={16} />
    </View>
    <SkeletonPlaceholder width={50} height={50} style={{ borderRadius: 25 }} />
  </View>
);

const HeaderContent = ({ user, onProfile }) => (
  <>
    <View>
      <Text style={styles.greeting}>Hello, {user.name}! 👋</Text>
      <Text style={styles.subGreeting}>Where to next?</Text>
    </View>
    <TouchableOpacity onPress={onProfile}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatar}>{user.avatar}</Text>
      </View>
    </TouchableOpacity>
  </>
);

const StatsSkeleton = () => (
  <>
    <View style={styles.statCard}><SkeletonPlaceholder width={40} height={28} /><SkeletonPlaceholder width={60} height={14} style={{ marginTop: 6 }} /></View>
    <View style={styles.statCard}><SkeletonPlaceholder width={40} height={28} /><SkeletonPlaceholder width={60} height={14} style={{ marginTop: 6 }} /></View>
    <View style={styles.statCard}><SkeletonPlaceholder width={40} height={28} /><SkeletonPlaceholder width={60} height={14} style={{ marginTop: 6 }} /></View>
  </>
);

const StatsContent = ({ trips }) => (
  <>
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{trips.length}</Text>
      <Text style={styles.statLabel}>Trips</Text>
    </View>
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>12</Text>
      <Text style={styles.statLabel}>Countries</Text>
    </View>
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>48</Text>
      <Text style={styles.statLabel}>Days</Text>
    </View>
  </>
);

const TripsSkeleton = () => (
  <>
    {[1, 2].map(i => (
      <View key={i} style={[styles.tripCard, { backgroundColor: '#FFFFFF', padding: 16 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <SkeletonPlaceholder width={120} height={20} />
          <SkeletonPlaceholder width={60} height={14} />
        </View>
        <SkeletonPlaceholder width={'70%'} height={16} style={{ marginBottom: 16 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <SkeletonPlaceholder width={50} height={14} />
          <SkeletonPlaceholder width={70} height={14} />
          <SkeletonPlaceholder width={60} height={14} />
        </View>
      </View>
    ))}
  </>
);

const TripsContent = ({ trips, onViewTrip }) => (
  trips.length === 0 ? (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🗺️</Text>
      <Text style={styles.emptyText}>No trips yet</Text>
      <Text style={styles.emptySubtext}>Create your first trip to get started!</Text>
    </View>
  ) : (
    trips.map((trip, index) => (
      <TouchableOpacity key={index} style={styles.tripCard} onPress={() => onViewTrip(trip)}>
        <LinearGradient colors={['#ffffff', '#f8f9fa']} style={styles.tripCardGradient}>
          <View style={styles.tripCardHeader}>
            <Text style={styles.tripDestination}>{trip.destination}</Text>
            <Text style={styles.tripStatus}>{trip.status}</Text>
          </View>
          <Text style={styles.tripDates}>{trip.dates}</Text>
          <View style={styles.tripMeta}>
            <Text style={styles.tripMetaItem}>👥 {trip.travelers}</Text>
            <Text style={styles.tripMetaItem}>💰 ${trip.budget}</Text>
            <Text style={styles.tripMetaItem}>📅 {trip.days} days</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    ))
  )
);

// Vui lòng thêm styles từ tệp gốc của bạn vào đây
const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subGreeting: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 4,
    opacity: 0.9,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    fontSize: 24,
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    marginTop: -10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  createTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  createTripIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  createTripText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tripsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  seeAll: {
    color: '#667eea',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  tripCard: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tripCardGradient: {
    padding: 16,
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripDestination: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  tripStatus: {
    fontSize: 12,
    color: '#666',
  },
  tripDates: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  tripMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tripMetaItem: {
    fontSize: 12,
    color: '#666',
  },
  trendingScroll: {
    marginBottom: 20,
  },
  trendingCard: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  trendingEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  trendingText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});

export default HomeScreen;