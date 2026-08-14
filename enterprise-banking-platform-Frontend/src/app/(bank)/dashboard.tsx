import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function BankDashboard() {
  const {
    user,
    logout,
    hasPermission,
  } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Bank / Staff</Text>
        <Text style={styles.title}>Bank Dashboard</Text>
        <Text style={styles.subtitle}>
          Signed in as {user?.username}
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionLabel}>Roles</Text>
        <Text style={styles.value}>
          {user?.roles.join(", ") || "No roles assigned"}
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionLabel}>Available Actions</Text>

        {hasPermission("ACCOUNT_CREATE") ? (
          <Text style={styles.actionText}>Create Account</Text>
        ) : null}

        {hasPermission("CUSTOMER_CREATE") ? (
          <Pressable
            onPress={() =>
              router.push("/customers/new" as Href)
            }
            style={styles.actionButton}
          >
            <Text style={styles.actionButtonText}>Create Customer</Text>
          </Pressable>
        ) : null}

        {hasPermission("USER_VIEW") ? (
          <Text style={styles.actionText}>View Users</Text>
        ) : null}

        {!hasPermission("ACCOUNT_CREATE") &&
        !hasPermission("CUSTOMER_CREATE") &&
        !hasPermission("USER_VIEW") ? (
          <Text style={styles.mutedText}>
            No staff actions are available for your permissions.
          </Text>
        ) : null}
      </View>

      <Pressable onPress={logout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 18,
    paddingHorizontal: 24,
    paddingTop: 72,
    backgroundColor: "#F5F7FA",
  },
  header: {
    gap: 6,
  },
  eyebrow: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: "#4B5563",
    fontSize: 16,
  },
  panel: {
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 18,
    backgroundColor: "#FFFFFF",
  },
  sectionLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  value: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  actionText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
  actionButton: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: "#1D4ED8",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  mutedText: {
    color: "#6B7280",
    fontSize: 15,
  },
  logoutButton: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
    backgroundColor: "#111827",
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
