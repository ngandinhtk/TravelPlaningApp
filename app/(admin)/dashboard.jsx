import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

const AdminDashboardScreen = () => {

  const onViewTrips = () => {
    router.push('/(admin)/trips');
  }
  const onViewUsers = () => {
    router.push('/(admin)/users');
  }
  const onViewTemplate = () => {
    router.push('/(admin)/templates');
  };

  const router = useRouter();   
  
    return (
     <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Management</Text>
        
        <TouchableOpacity onPress={onViewUsers}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.card}>
            <Text style={styles.cardIcon}>👥</Text>
            <Text style={styles.cardTitle}>Manage Users</Text>
            <Text style={styles.cardDescription}>View, edit, and manage user accounts.</Text>
          </LinearGradient>
        </TouchableOpacity>

           <TouchableOpacity onPress={() => router.push('/(admin)/reports')}>
          <LinearGradient colors={['#f6d365', '#fda085']} style={styles.card}>
            <Text style={styles.cardIcon}>📊</Text>
            <Text style={styles.cardTitle}>View Reports</Text>
            <Text style={styles.cardDescription}>Access system reports and analytics.</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={onViewTrips}>
          <LinearGradient colors={['#ca7bd3ff', '#ee8694ff']} style={styles.card}>
            <Text style={styles.cardIcon}>✈️</Text>
            <Text style={styles.cardTitle}>Manage Trips</Text>
            <Text style={styles.cardDescription}>View all trips from all users in the system.</Text>
          </LinearGradient>
          
        </TouchableOpacity>
        <TouchableOpacity onPress={onViewTemplate}>
          <LinearGradient colors={['#93c7a5ff', '#68dfc9ff']} style={styles.card}>
            <Text style={styles.cardIcon}>📄</Text>
            <Text style={styles.cardTitle}>Manage Templates</Text>
            <Text style={styles.cardDescription}>View and edit trip templates.</Text>
          </LinearGradient>
        </TouchableOpacity>
     
        <TouchableOpacity style={styles.bottonLogout} onPress={() => router.push('/auth/login')}>           
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

    );
};
export default AdminDashboardScreen;
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
    backButton: { padding: 5 },     
    backButtonText: { color: '#FFF', fontSize: 24 },
    content: { flex: 1, padding: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    card: { 
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    cardIcon: { fontSize: 30, marginBottom: 10 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 5 },
    cardDescription: { fontSize: 14, color: '#FFF' },
    bottonLogout: { width: '40%', alignSelf: 'flex-end', marginTop: 60, padding: 15, backgroundColor: '#667eea', borderRadius: 10, alignItems: 'center'}
});

