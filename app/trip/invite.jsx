import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTrip } from "../../context/TripContext";
import { useUser } from "../../context/UserContext";

// Mock data for demonstration if trip doesn't have collaborators yet
const MOCK_COLLABORATORS = [
  {
    uid: "1",
    displayName: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    role: "owner",
    photoURL: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    uid: "2",
    displayName: "Trần Thị B",
    email: "tranthib@example.com",
    role: "editor",
    photoURL: "https://randomuser.me/api/portraits/women/2.jpg",
  },
];

const InviteScreen = () => {
  const router = useRouter();
  const { trip } = useTrip();
  const { user } = useUser();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  // In a real app, this would come from trip.collaborators
  const [collaborators, setCollaborators] = useState(
    trip?.collaborators || MOCK_COLLABORATORS,
  );

  const handleInvite = async () => {
    if (!email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email.");
      return;
    }

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ.");
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newMember = {
        uid: Date.now().toString(),
        displayName: email.split("@")[0],
        email: email,
        role: "viewer", // Default role
        photoURL: null,
      };

      setCollaborators([...collaborators, newMember]);
      setEmail("");
      setLoading(false);
      Alert.alert("Thành công", `Đã gửi lời mời đến ${email}`);
    }, 1000);
  };

  const handleShareLink = async () => {
    try {
      const result = await Share.share({
        message: `Tham gia chuyến đi đến ${trip?.destination || "địa điểm thú vị"} cùng tôi trên TravelMind AI! Nhấn vào đây: https://travelmind.ai/join/${trip?.id}`,
      });
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  const handleChangeRole = (uid, currentRole) => {
    if (currentRole === "owner") return; // Cannot change owner role

    const newRole = currentRole === "editor" ? "viewer" : "editor";

    const updatedList = collaborators.map((member) =>
      member.uid === uid ? { ...member, role: newRole } : member,
    );
    setCollaborators(updatedList);
  };

  const handleRemoveMember = (uid, role) => {
    if (role === "owner") return;

    Alert.alert(
      "Xóa thành viên",
      "Bạn có chắc chắn muốn xóa thành viên này khỏi chuyến đi?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            setCollaborators(collaborators.filter((c) => c.uid !== uid));
          },
        },
      ],
    );
  };

  const renderMember = ({ item }) => (
    <View style={styles.memberItem}>
      <Image
        source={
          item.photoURL
            ? { uri: item.photoURL }
            : require("../../lib/character.jpg")
        }
        style={styles.avatar}
      />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.displayName || item.email}</Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.roleBadge,
          item.role === "owner" ? styles.roleOwner : styles.roleMember,
        ]}
        onPress={() => handleChangeRole(item.uid, item.role)}
        disabled={item.role === "owner"}
      >
        <Text
          style={[
            styles.roleText,
            item.role === "owner"
              ? styles.roleTextOwner
              : styles.roleTextMember,
          ]}
        >
          {item.role === "owner"
            ? "Chủ sở hữu"
            : item.role === "editor"
              ? "Chỉnh sửa"
              : "Xem"}
        </Text>
      </TouchableOpacity>

      {item.role !== "owner" && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveMember(item.uid, item.role)}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mời bạn bè</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.inviteSection}>
          <Text style={styles.sectionTitle}>Thêm thành viên</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập email người nhận..."
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={handleInvite}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.inviteButtonText}>Mời</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.shareLinkButton}
            onPress={handleShareLink}
          >
            <Text style={styles.shareLinkText}>
              🔗 Chia sẻ liên kết tham gia
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>
            Thành viên ({collaborators.length})
          </Text>
          <FlatList
            data={collaborators}
            renderItem={renderMember}
            keyExtractor={(item) => item.uid}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  backButtonText: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
  content: { flex: 1, padding: 20 },
  inviteSection: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  inputContainer: { flexDirection: "row", marginBottom: 15 },
  input: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    fontSize: 14,
  },
  inviteButton: {
    backgroundColor: "#667eea",
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  inviteButtonText: { color: "#FFF", fontWeight: "bold" },
  shareLinkButton: {
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 5,
  },
  shareLinkText: { color: "#667eea", fontWeight: "600" },
  membersSection: { flex: 1 },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#E0E0E0",
  },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: "bold", color: "#333" },
  memberEmail: { fontSize: 12, color: "#666" },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  roleOwner: { backgroundColor: "#FFF9C4" },
  roleMember: { backgroundColor: "#E3F2FD" },
  roleText: { fontSize: 10, fontWeight: "bold" },
  roleTextOwner: { color: "#FBC02D" },
  roleTextMember: { color: "#2196F3" },
  removeButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    borderRadius: 15,
  },
  removeButtonText: { color: "#FF5252", fontWeight: "bold" },
});

export default InviteScreen;
