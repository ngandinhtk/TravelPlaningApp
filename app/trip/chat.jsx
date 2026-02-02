import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    addDoc,
    collection,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
} from "firebase/firestore";
import { ArrowLeft, Send } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useTrip } from "../../context/TripContext";
import { useUser } from "../../context/UserContext";
import { db } from "../../services/firebase";

const ChatScreen = () => {
  const router = useRouter();
  const { trip } = useTrip();
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!trip?.id) return;

    const messagesRef = collection(db, "trips", trip.id, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [trip?.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messagesRef = collection(db, "trips", trip.id, "messages");
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        senderId: user.uid,
        senderName: user.displayName || user.email.split("@")[0],
        senderPhoto: user.photoURL || null,
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === user.uid;

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        {!isMe && (
          <Image
            source={
              item.senderPhoto
                ? { uri: item.senderPhoto }
                : require("../../lib/character.jpg")
            }
            style={styles.avatar}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          {!isMe && <Text style={styles.senderName}>{item.senderName}</Text>}
          <Text
            style={[
              styles.messageText,
              isMe ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thảo luận nhóm</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        style={styles.inputWrapper}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Nhập tin nhắn..."
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
          >
            <Send color="#FFF" size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
  messagesList: { padding: 15, paddingBottom: 20 },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-end",
  },
  myMessageContainer: { justifyContent: "flex-end" },
  otherMessageContainer: { justifyContent: "flex-start" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#E0E0E0",
  },
  messageBubble: { maxWidth: "75%", padding: 12, borderRadius: 16 },
  myMessageBubble: { backgroundColor: "#667eea", borderBottomRightRadius: 4 },
  otherMessageBubble: {
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  senderName: { fontSize: 10, color: "#999", marginBottom: 4 },
  messageText: { fontSize: 15 },
  myMessageText: { color: "#FFF" },
  otherMessageText: { color: "#333" },
  inputWrapper: {
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  inputContainer: { flexDirection: "row", alignItems: "center", padding: 8 },
  input: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
});

export default ChatScreen;
