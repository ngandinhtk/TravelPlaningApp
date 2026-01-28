import { Clock, MapPin } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ItineraryItem = ({ item, onPress, onLongPress }) => {
  const getCategoryColor = (category) => {
    const colors = {
      Food: "#FF9F43",
      Sightseeing: "#54A0FF",
      Transport: "#5F27CD",
      Hotel: "#FF6B6B",
      Other: "#8395A7",
    };
    return colors[category] || colors.Other;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.timeLine,
          { backgroundColor: getCategoryColor(item.category) },
        ]}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          {/* <TouchableOpacity>
            <MoreVertical size={16} color="#999" />
          </TouchableOpacity> */}
        </View>

        <View style={styles.details}>
          {item.time && (
            <View style={styles.detailItem}>
              <Clock size={12} color="#666" />
              <Text style={styles.detailText}>{item.time}</Text>
            </View>
          )}

          {item.location && (
            <View style={styles.detailItem}>
              <MapPin size={12} color="#666" />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          )}
        </View>

        {item.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {item.notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
    height: 90,
  },
  timeLine: {
    width: 6,
    height: "100%",
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#666",
  },
  notes: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
});

export default ItineraryItem;
