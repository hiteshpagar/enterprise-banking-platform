import { Pressable, StyleSheet, Text, View } from "react-native";
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
    marginTop: 30,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#111827",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});