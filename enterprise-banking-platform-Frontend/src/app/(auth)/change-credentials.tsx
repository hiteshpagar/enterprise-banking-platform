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
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { changeCredentials } from "@/api/auth";
import { Colors } from "@/constants/theme";

export default function ChangeCredentialsScreen() {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live password validation criteria
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumberOrSpecial = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

  async function handleSubmit() {
    setError("");

    if (!newUsername.trim()) {
      setError("New username is required.");
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumberOrSpecial) {
      setError("Please ensure your password satisfies all security requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await changeCredentials({
        newUsername: newUsername.trim(),
        newPassword,
        confirmPassword,
      });

      router.replace("/(auth)/login");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to update credentials. Please try again.");
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
          {/* Header Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="key" size={32} color={Colors.actionBlue} />
          </View>

          <Text style={styles.title}>Change Your Credentials</Text>
          <Text style={styles.subtitle}>
            For your security, please set new username and password to continue.
          </Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>New Username</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  value={newUsername}
                  onChangeText={setNewUsername}
                  placeholder="Enter new username"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                  style={styles.input}
                />
                <Pressable onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textSecondary} />
                </Pressable>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                  style={styles.input}
                />
                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textSecondary} />
                </Pressable>
              </View>
            </View>

            {/* Checklist */}
            <View style={styles.checklistCard}>
              <Text style={styles.checklistTitle}>Password must contain:</Text>
              <View style={styles.checkItem}>
                <Ionicons
                  name={hasMinLength ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={hasMinLength ? Colors.success : Colors.textSecondary}
                />
                <Text style={[styles.checkText, hasMinLength && styles.checkTextActive]}>
                  At least 8 characters
                </Text>
              </View>
              <View style={styles.checkItem}>
                <Ionicons
                  name={hasUppercase ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={hasUppercase ? Colors.success : Colors.textSecondary}
                />
                <Text style={[styles.checkText, hasUppercase && styles.checkTextActive]}>
                  One uppercase letter
                </Text>
              </View>
              <View style={styles.checkItem}>
                <Ionicons
                  name={hasLowercase ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={hasLowercase ? Colors.success : Colors.textSecondary}
                />
                <Text style={[styles.checkText, hasLowercase && styles.checkTextActive]}>
                  One lowercase letter
                </Text>
              </View>
              <View style={styles.checkItem}>
                <Ionicons
                  name={hasNumberOrSpecial ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={hasNumberOrSpecial ? Colors.success : Colors.textSecondary}
                />
                <Text style={[styles.checkText, hasNumberOrSpecial && styles.checkTextActive]}>
                  One number or special character
                </Text>
              </View>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleSubmit}
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
                <Text style={styles.buttonText}>Update Credentials</Text>
              )}
            </Pressable>
          </View>
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
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
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
  checklistCard: {
    backgroundColor: Colors.lightBlue,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  checklistTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 2,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  checkTextActive: {
    color: Colors.success,
    fontWeight: "600",
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
});
