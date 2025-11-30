import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BackButton from '../../components/common/BackButton';
import CustomModal from '../../components/common/Modal';
import { deleteUserAccount, getAllUsers, updateUserProfile } from '../../services/userService';

const ManageUsersScreen = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalState, setModalState] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchUsers = async () => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);

      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    setModalState({
      visible: true,
      title: 'Xác nhận thay đổi vai trò',
      message: `Bạn có chắc muốn thay đổi vai trò của ${user.displayName} thành ${newRole}?`,
      onConfirm: async () => {
        try {
          await updateUserProfile(user.id, { role: newRole });
          setUsers(currentUsers =>
            currentUsers.map(u =>
              u.id === user.id ? { ...u, role: newRole } : u
            )
          );
        } catch (error) {
          console.error("Error updating role:", error);
          // Có thể hiển thị một modal lỗi khác ở đây
        }
      },
    });
  };

  const handleDeleteUser = (user) => {
    setModalState({
      visible: true,
      title: 'Xác nhận xóa người dùng',
      message: `Bạn có chắc muốn xóa vĩnh viễn người dùng ${user.displayName}? Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          await deleteUserAccount(user.id, false);
          setUsers(currentUsers => currentUsers.filter(u => u.id !== user.id));
        } catch (error) {
          console.error("Error deleting user:", error);
          // Có thể hiển thị một modal lỗi khác ở đây
        }
      },
    });
  };

  const handleConfirmAction = () => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
    setModalState({ visible: false, title: '', message: '', onConfirm: () => {} });
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <Image 
        source={(item?.photoURL && typeof item.photoURL === 'string' && item.photoURL.startsWith('http')) ? { uri: item.photoURL } : require('../../lib/character.jpg')} 
        style={styles.avatar} 
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.displayName}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={() => handleToggleRole(item)} style={styles.actionButton}>
          <Text style={styles.toggleRoleText}>
            {item.role === 'admin' ? 'Set User' : 'Set Admin'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteUser(item)} style={styles.actionButton}>
          <Text style={styles.deleteText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomModal
        visible={modalState.visible}
        title={modalState.title}
        onClose={() => setModalState({ ...modalState, visible: false })}
        onConfirm={handleConfirmAction}
      >
        <Text>{modalState.message}</Text>
      </CustomModal>

      <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Manage Users</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        onRefresh={fetchUsers}
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#777', marginTop: 2 },
  userRole: { fontSize: 12, fontWeight: 'bold', color: '#667eea', textTransform: 'uppercase' },
  adminRole: { color: '#f5576c' },
  actionsContainer: {
    alignItems: 'flex-end',
  },
  actionButton: {
    paddingVertical: 4,
  },
  toggleRoleText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ManageUsersScreen;
