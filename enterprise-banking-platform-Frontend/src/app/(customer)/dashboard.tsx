import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function CustomerDashboard() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Enterprise Banking Platform
      </Text>

      <Text style={styles.subtitle}>
        Customer Dashboard
      </Text>

      <Pressable
        onPress={() => router.push("/accounts" as Href)}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>View Accounts</Text>
      </Pressable>

      <Pressable
        onPress={logout}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 18,
  },
  button: {
    marginTop: 14,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#111827",
  },
  primaryButton: {
    marginTop: 30,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#1D4ED8",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
