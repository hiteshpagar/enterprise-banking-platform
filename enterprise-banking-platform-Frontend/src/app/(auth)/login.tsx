import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { Colors } from "@/constants/theme";

export default function LoginScreen() {
  const { login, isAuthenticated, requiresCredentialChange } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isEmployeePortal, setIsEmployeePortal] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated && requiresCredentialChange) {
    return <Redirect href="/(auth)/change-credentials" />;
  }

  async function handleLogin() {
    setError("");

    if (!username.trim()) {
      setError("Username / Employee ID is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(username.trim(), password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to login. Please check credentials.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          {/* Top Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Ionicons name="business" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.brandName}>EBP</Text>
            <Text style={styles.brandFullTitle}>Enterprise Banking Platform</Text>
          </View>

          {/* Portal Switcher Pill */}
          <View style={styles.tabContainer}>
            <Pressable
              style={[styles.tabButton, !isEmployeePortal && styles.activeTabButton]}
              onPress={() => setIsEmployeePortal(false)}
            >
              <Text style={[styles.tabText, !isEmployeePortal && styles.activeTabText]}>
                Customer Login
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tabButton, isEmployeePortal && styles.activeTabButton]}
              onPress={() => setIsEmployeePortal(true)}
            >
              <Text style={[styles.tabText, isEmployeePortal && styles.activeTabText]}>
                Employee Portal
              </Text>
            </Pressable>
          </View>

          <View style={styles.headerTextGroup}>
            <Text style={styles.title}>
              {isEmployeePortal ? "Employee Portal" : "Welcome Back"}
            </Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>
                {isEmployeePortal ? "Employee ID" : "Username"}
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder={isEmployeePortal ? "Enter employee ID" : "Enter username"}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                  style={styles.input}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textSecondary} />
                </Pressable>
              </View>
            </View>

            <View style={styles.rememberRow}>
              <Pressable style={styles.checkboxRow} onPress={() => setRememberMe(!rememberMe)}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </Pressable>
              <Pressable>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleLogin}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                isSubmitting && styles.buttonDisabled,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </Pressable>

            {!isEmployeePortal && (
              <Text style={styles.contactText}>
                Don't have an account? <Text style={styles.contactLink}>Contact your bank</Text>
              </Text>
            )}
          </View>
        </View>

        {/* Security Priority Banner at Bottom */}
        <View style={styles.securityBanner}>
          <Ionicons name="shield-checkmark" size={18} color={Colors.actionBlue} />
          <Text style={styles.securityText}>Your security is our priority</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#0B1D3A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  brandName: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.primary,
    letterSpacing: 1,
  },
  brandFullTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    padding: 3,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.actionBlue,
    fontWeight: "700",
  },
  headerTextGroup: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: Colors.textPrimary,
  },
  eyeIcon: {
    padding: 4,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: Colors.actionBlue,
    borderColor: Colors.actionBlue,
  },
  rememberText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.actionBlue,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorText: {
    fontSize: 13,
    color: Colors.danger,
    flex: 1,
  },
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.actionBlue,
    marginTop: 4,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  contactText: {
    textAlign: "center",
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  contactLink: {
    color: Colors.actionBlue,
    fontWeight: "700",
  },
  securityBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.lightBlue,
  },
  securityText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },
});