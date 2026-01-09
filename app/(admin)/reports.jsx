import { ScrollView, StyleSheet, Text } from "react-native";
const AdminReportsScreen = () => {  
    return (
        <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>Reports</Text>
            <Text style={styles.sectionDescription}>This is the reports screen where you can view various system reports and analytics.</Text>
        </ScrollView>
    );
}   
export default AdminReportsScreen;

const styles = StyleSheet.create({
    content: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F8F9FA',
    },
    sectionTitle: {     
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    sectionDescription: {
        fontSize: 16,
        color: '#666',
    },
});