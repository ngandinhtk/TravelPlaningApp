import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useUser } from '../../context/UserContext';

const AdminTemplateScreen = () => {
  const router = useRouter();   
  const { user } = useUser();
    console.log(user);
    
    return (
     <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Management</Text>

        <TouchableOpacity onPress={() => router.push('/(admin)/templates/create')}>
          <LinearGradient colors={['#43e97b', '#38f9d7']} style={styles.card}>
            <Text style={styles.cardIcon}>➕</Text> 
            <Text style={styles.cardTitle}>Create New Template</Text>
            <Text style={styles.cardDescription}>Create a new trip template.</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    );
};
export default AdminTemplateScreen;
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
});
    