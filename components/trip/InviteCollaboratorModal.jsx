import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    addCollaborator,
    removeCollaborator,
} from "../../services/tripService";

const InviteCollaboratorModal = ({
  visible,
  onClose,
  trip,
  onUpdate,
  currentUserId,
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isOwner = trip?.userId === currentUserId;

  const handleInvite = async () => {
    if (!email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }

    setLoading(true);
    try {
      await addCollaborator(trip.id, email.trim().toLowerCase());
      Alert.alert("Thành công", "Đã thêm thành viên vào chuyến đi!");
      setEmail("");
      if (onUpdate) onUpdate();
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể thêm thành viên");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (collaborator) => {
    Alert.alert(
      "Xác nhận",
      `Bạn có chắc muốn xóa ${collaborator.displayName} khỏi chuyến đi?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await removeCollaborator(trip.id, collaborator.uid, collaborator);
              if (onUpdate) onUpdate();
            } catch (error) {
              console.error(error);
              Alert.alert("Lỗi", "Không thể xóa thành viên");
            }
          },
        },
      ],
    );
  };

  const renderCollaborator = ({ item }) => (
    <View style={styles.userRow}>
      <View style={styles.userInfo}>
        <Image
          source={
            item.photoURL
              ? { uri: item.photoURL }
              : require("../../assets/images/react-logo.png")
          }
          style={styles.avatar}
        />
        <View>
          <Text style={styles.userName}>{item.displayName || item.email}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
      </View>
      {isOwner && (
        <TouchableOpacity
          onPress={() => handleRemove(item)}
          style={styles.removeButton}
        >
          <Text style={styles.removeText}>Xóa</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Quản lý thành viên</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Mời bạn bè</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập email bạn bè..."
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity
              style={[styles.inviteButton, loading && styles.disabledButton]}
              onPress={handleInvite}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.inviteText}>Mời</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>
            Danh sách thành viên ({trip?.collaboratorDetails?.length || 0})
          </Text>
          <FlatList
            data={trip?.collaboratorDetails || []}
            renderItem={renderCollaborator}
            keyExtractor={(item) => item.uid}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Chưa có thành viên nào.</Text>
            }
            style={styles.list}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  closeText: { fontSize: 24, color: "#999" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
  },
  inputContainer: { flexDirection: "row", gap: 10, marginBottom: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  inviteButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 20,
    justifyContent: "center",
    borderRadius: 8,
  },
  disabledButton: { opacity: 0.7 },
  inviteText: { color: "#fff", fontWeight: "bold" },
  list: { maxHeight: 300 },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#eee" },
  userName: { fontWeight: "600" },
  userEmail: { fontSize: 12, color: "#666" },
  removeButton: { padding: 8 },
  removeText: { color: "#ff4444", fontSize: 12 },
  emptyText: {
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },
});

export default InviteCollaboratorModal;
