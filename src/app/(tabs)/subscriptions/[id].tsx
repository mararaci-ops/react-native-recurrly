import { Link, useLocalSearchParams } from "expo-router";
import { fontFamilies } from "@/constants/fonts";
import { StyleSheet, Text, View } from "react-native";

export default function SubscriptionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Subscription</Text>
      <Text style={styles.title}>Plan {id ?? "Details"}</Text>
      <Text style={styles.description}>
        You are viewing subscription #{id ?? "unknown"}.
      </Text>
      <Link className="font-sans-semibold" href={"/"}>
        Pantalla de inicio
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fb",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  eyebrow: {
    fontSize: 12,
    fontFamily: fontFamilies.bold,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#6b7280",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: fontFamilies.bold,
    color: "#111827",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
    fontFamily: fontFamilies.regular,
  },
});
