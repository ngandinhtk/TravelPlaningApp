import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, User } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useTrip } from "../../context/TripContext";
import { useUser } from "../../context/UserContext";
import { showToast } from "../../lib/showToast";

const InviteScreen = () => {
  const router = useRouter();
  const { trip } = useTrip();
  const { user } = useUser();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Mock members data if trip doesn't have it yet
  const members = trip?.members || [
    {
      id: user?.uid || "owner",
      name: user?.displayName || "Bạn",
      email: user?.email,
      role: "owner",
      avatar: "👤",
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleInvite = async () => {
    if (!email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }

    setLoading(true);
    // Simulate API call to invite user
    setTimeout(() => {
      setLoading(false);
      showToast(`Đã gửi lời mời đến ${email}`);
      setEmail("");
    }, 1500);
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `Tham gia chuyến đi "${trip?.destination}" cùng tôi! Mã chuyến đi: ${trip?.id}`,
      });
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    }
  };

  const renderMember = ({ item }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberAvatar}>
        {item.avatar === "👤" || !item.avatar ? (
          <User size={24} color="#555" />
        ) : (
          <Text style={{ fontSize: 20 }}>{item.avatar}</Text>
        )}
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {item.name} {item.id === user?.uid ? "(Bạn)" : ""}
        </Text>
        <Text style={styles.memberRole}>
          {item.role === "owner" ? "Chủ sở hữu" : "Thành viên"}
        </Text>
      </View>
      {item.role !== "owner" && (
        <TouchableOpacity style={styles.removeButton}>
          <Text style={styles.removeButtonText}>Xóa</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mời bạn bè</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.inviteSection}>
          <Text style={styles.sectionTitle}>Thêm thành viên</Text>
          <Text style={styles.sectionSubtitle}>
            Nhập email để mời bạn bè tham gia chuyến đi này.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="nhap@email.com"
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
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.inviteButtonText}>Mời</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={handleShareLink}>
          <Text style={styles.shareButtonText}>
            🔗 Chia sẻ liên kết tham gia
          </Text>
        </TouchableOpacity>

        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>Thành viên ({members.length})</Text>
          <FlatList
            data={members}
            renderItem={renderMember}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 50,
  },
  backButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  content: { flex: 1, padding: 20 },
  inviteSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  sectionSubtitle: { fontSize: 14, color: "#666", marginBottom: 15 },
  inputContainer: { flexDirection: "row", gap: 10 },
  input: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  inviteButton: {
    backgroundColor: "#667eea",
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  inviteButtonText: { color: "#fff", fontWeight: "bold" },
  shareButton: {
    backgroundColor: "#eef0ff",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#dae0ff",
  },
  shareButtonText: { color: "#667eea", fontWeight: "600", fontSize: 16 },
  membersSection: { flex: 1 },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f2f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: "600", color: "#333" },
  memberRole: { fontSize: 12, color: "#999" },
  removeButton: { padding: 8 },
  removeButtonText: { color: "#ff4757", fontSize: 12, fontWeight: "600" },
});

export default InviteScreen;
