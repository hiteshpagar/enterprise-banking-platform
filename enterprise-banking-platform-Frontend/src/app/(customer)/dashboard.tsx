import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function CustomerDashboard() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enterprise Banking Platform</Text>

      <Text style={styles.subtitle}>Customer Dashboard</Text>

      <Pressable
        onPress={() => router.push("/(customer)/accounts" as Href)}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>View Accounts</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/(customer)/beneficiaries" as Href)}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonText}>Manage Beneficiaries</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/(customer)/fund-transfer" as Href)}
        style={styles.transferButton}
      >
        <Text style={styles.buttonText}>Fund Transfer</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/(customer)/transactions" as Href)}
        style={styles.historyButton}
      >
        <Text style={styles.buttonText}>Transaction History</Text>
      </Pressable>

      <Pressable onPress={logout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Logout</Text>
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

  primaryButton: {
    marginTop: 30,
    width: "100%",
    maxWidth: 320,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryButton: {
    marginTop: 12,
    width: "100%",
    maxWidth: 320,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#0F766E",
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  transferButton: {
    marginTop: 12,
    width: "100%",
    maxWidth: 320,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#4F46E5",
    alignItems: "center",
  },

  historyButton: {
    marginTop: 12,
    width: "100%",
    maxWidth: 320,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  logoutButton: {
    marginTop: 24,
    width: "100%",
    maxWidth: 320,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#111827",
    alignItems: "center",
  },

  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
