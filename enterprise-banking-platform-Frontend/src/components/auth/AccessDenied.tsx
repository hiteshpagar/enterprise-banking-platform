import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

interface AccessDeniedProps {
  title?: string;
  message?: string;
}

export function AccessDenied({
  title = "Access Denied",
  message = "You do not have permission to access this section.",
}: AccessDeniedProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <Pressable
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/");
          }
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Go Back</Text>
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
    backgroundColor: "#F5F7FA",
  },
  title: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  message: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
  },
  button: {
    marginTop: 24,
    borderRadius: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
    backgroundColor: "#111827",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
