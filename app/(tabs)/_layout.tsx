import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, StyleSheet } from 'react-native';
import OnboardingScreen from '../../screens/home/OnboardingScreen';
import { auth, db } from '../../services/firebase';
import { User } from '../../types/index';
// const { width, height } = Dimensions.get('window');

const authService = {
  getUserDetails: async (uid: string) => {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  },
};

// ============================================
// MAIN APP COMPONENT
// ============================================

export default function TabLayout() {
  // const mockUser: User = {
  //   id: 'mock-user-123',
  //   name: 'Mock User',
  //   email: 'mock@example.com',
  //   avatar: '🤖',
  // };

  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  // const [trips, setTrips] = useState<Trip[]>([]);
  // const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  // const [itinerary, setItinerary] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Người dùng đã đăng nhập, lấy thông tin chi tiết từ Firestor
        const userDetails = await authService.getUserDetails(firebaseUser.uid);
        setUser(userDetails); // User is logged in
        setCurrentScreen('home'); // Show Tabs for logged-in user
      } else {
        // User is logged out or not logged in
        setUser(null);
        setCurrentScreen('onboarding');
      }
      if (initializing) {
        setInitializing(false);
      }
    });

    return unsubscribe; // Hủy đăng ký khi component unmount
  }, []);


  const renderScreen = () => {
    if (initializing) {
      // You can return a splash screen or a loading indicator here
      return <OnboardingScreen onComplete={() => setCurrentScreen('onboarding')} />; // Or a proper splash screen component
    }


  };

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="dark" />
      {renderScreen()}
    </SafeAreaView>
  );
}

// ============================================
// 11. STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Splash Screen
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  logoSubtext: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },

  // Onboarding
  onboardingContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 30,
  },
  onboardingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onboardingIcon: {
    fontSize: 100,
    marginBottom: 40,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  onboardingDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    opacity: 0.9,
  },
  onboardingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  onboardingButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  onboardingButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: '600',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },

  // Auth Screens
  authContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  authHeader: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  authLogo: {
    fontSize: 60,
    marginBottom: 20,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  authForm: {
    padding: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#667eea',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#999',
    fontSize: 14,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  socialButtonText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  signupPromptText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    padding: 20,
  },
  backButtonText: {
    color: '#667eea',
    fontSize: 16,
  },
  backButtonTextWhite: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Home Screen
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
    marginTop: -20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
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
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  navIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
  navIconActive: {
    fontSize: 24,
  },
  navLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  navLabelActive: {
    fontSize: 11,
    color: '#667eea',
    marginTop: 4,
  },

  // Create Trip Screen
  createTripContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  createTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  createTripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepIndicator: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  createTripForm: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  inputRow: {
    flexDirection: 'row',
  },
  nextButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  interestChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  interestChipEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  interestChipText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  interestChipTextActive: {
    color: '#FFFFFF',
  },

  // Generating Screen
  generatingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  generatingIcon: {
    fontSize: 80,
    marginBottom: 30,
  },
  generatingStatus: {
    fontSize: 18,
    color: '#1A1A1A',
    marginTop: 20,
    textAlign: 'center',
  },
  generatingTitle: {
    fontSize: 18,
    color: '#1A1A1A',
    marginTop: 20,
    textAlign: 'center',
  }})