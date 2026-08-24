import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { router, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { Colors } from "@/constants/theme";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { BottomNavBar } from "@/components/common/BottomNavBar";

export default function BankProfileScreen() {
  const { logout, user } = useAuth();
  const userName = user?.username || "";
  const userEmail = user?.email || "";
  const rawRole = user?.roles?.length ? user.roles[0] : "Bank Staff";
  const userRole = rawRole.replace(/^ROLE_/, "").replace(/_/g, " ");
  const initials = userName.length >= 2 ? userName.slice(0, 2).toUpperCase() : "B";

  // Active Modals
  const [activeModal, setActiveModal] = useState<
    "PERSONAL_INFO" | "SECURITY" | "NOTIFICATIONS" | "HELP" | null
  >(null);

  // Editable Personal Info State
  const [editName, setEditName] = useState(userName);
  const [editEmail, setEditEmail] = useState(userEmail || "officer@enterprisebank.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [department, setDepartment] = useState("Operations & Compliance");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  // Security Toggles State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("15 mins");

  // Notification Toggles State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);

  async function handleSaveProfile() {
    setIsSaving(true);
    setSaveSuccess("");
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess("Profile information updated successfully!");
    }, 600);
  }

  const options = [
    {
      id: "PERSONAL_INFO",
      label: "Personal Information",
      icon: "person-outline" as const,
      sub: "View and update employee details",
    },
    {
      id: "CHANGE_PWD",
      label: "Change Password",
      icon: "lock-closed-outline" as const,
      sub: "Update account login password",
      route: "/(auth)/change-credentials" as Href,
    },
    {
      id: "SECURITY",
      label: "Security Settings",
      icon: "shield-checkmark-outline" as const,
      sub: "2FA, active sessions, and security logs",
    },
    {
      id: "NOTIFICATIONS",
      label: "Notification Preferences",
      icon: "notifications-outline" as const,
      sub: "Email, SMS, and system alerts",
    },
    {
      id: "HELP",
      label: "Help & Support",
      icon: "help-circle-outline" as const,
      sub: "Internal IT helpdesk and portal docs",
    },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader title="Profile & Settings" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainWrapper}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{userName}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.profileRole}>{userRole}</Text>
              </View>
              {userEmail ? <Text style={styles.profileEmpId}>{userEmail}</Text> : null}
            </View>
          </View>

          {/* Options List */}
          <View style={styles.optionsList}>
            {options.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [styles.optionCard, pressed && styles.pressed]}
                onPress={() => {
                  if (item.route) {
                    router.push(item.route);
                  } else {
                    setActiveModal(item.id as any);
                  }
                }}
              >
                <View style={styles.optionLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name={item.icon} size={20} color={Colors.actionBlue} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionLabel}>{item.label}</Text>
                    <Text style={styles.optionSub}>{item.sub}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
              </Pressable>
            ))}

            <Pressable
              style={({ pressed }) => [styles.optionCard, styles.logoutCard, pressed && styles.pressed]}
              onPress={logout}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: "#FEE2E2" }]}>
                  <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
                </View>
                <View>
                  <Text style={styles.logoutLabel}>Logout</Text>
                  <Text style={styles.optionSub}>Sign out of bank portal</Text>
                </View>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Modal 1: Personal Information */}
      <Modal
        visible={activeModal === "PERSONAL_INFO"}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Personal Information</Text>
              <Pressable onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <View style={styles.modalForm}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Username</Text>
                  <TextInput value={editName} onChangeText={setEditName} style={styles.input} />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Email Address</Text>
                  <TextInput value={editEmail} onChangeText={setEditEmail} style={styles.input} keyboardType="email-address" />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Phone Number</Text>
                  <TextInput value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Department</Text>
                  <TextInput value={department} onChangeText={setDepartment} style={styles.input} />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Assigned Role</Text>
                  <View style={styles.disabledBox}>
                    <Text style={styles.disabledText}>{userRole}</Text>
                  </View>
                </View>

                {saveSuccess ? (
                  <View style={styles.successBox}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                    <Text style={styles.successText}>{saveSuccess}</Text>
                  </View>
                ) : null}

                <Pressable style={styles.saveBtn} onPress={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Security Settings */}
      <Modal
        visible={activeModal === "SECURITY"}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Security Settings</Text>
              <Pressable onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleTitle}>Two-Factor Authentication (2FA)</Text>
                  <Text style={styles.toggleSub}>Require OTP code on new browser logins</Text>
                </View>
                <Switch
                  value={twoFactorEnabled}
                  onValueChange={setTwoFactorEnabled}
                  trackColor={{ false: Colors.border, true: Colors.actionBlue }}
                />
              </View>
              <View style={styles.divider} />

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Session Inactivity Timeout</Text>
                <View style={styles.timeoutRow}>
                  {["15 mins", "30 mins", "60 mins"].map((t) => (
                    <Pressable
                      key={t}
                      style={[styles.timeoutChip, sessionTimeout === t && styles.timeoutChipActive]}
                      onPress={() => setSessionTimeout(t)}
                    >
                      <Text style={[styles.timeoutChipText, sessionTimeout === t && styles.timeoutChipTextActive]}>
                        {t}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={styles.divider} />

              <Pressable
                style={styles.outlineBtn}
                onPress={() => {
                  setActiveModal(null);
                  router.push("/(auth)/change-credentials");
                }}
              >
                <Ionicons name="key-outline" size={18} color={Colors.actionBlue} />
                <Text style={styles.outlineBtnText}>Change Password</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 3: Notification Preferences */}
      <Modal
        visible={activeModal === "NOTIFICATIONS"}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notification Preferences</Text>
              <Pressable onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleTitle}>Email Notifications</Text>
                  <Text style={styles.toggleSub}>Receive daily summaries and critical audit alerts</Text>
                </View>
                <Switch
                  value={emailAlerts}
                  onValueChange={setEmailAlerts}
                  trackColor={{ false: Colors.border, true: Colors.actionBlue }}
                />
              </View>
              <View style={styles.divider} />

              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleTitle}>SMS Security Alerts</Text>
                  <Text style={styles.toggleSub}>Instant SMS notifications for high-value transactions</Text>
                </View>
                <Switch
                  value={smsAlerts}
                  onValueChange={setSmsAlerts}
                  trackColor={{ false: Colors.border, true: Colors.actionBlue }}
                />
              </View>
              <View style={styles.divider} />

              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleTitle}>In-App Push Alerts</Text>
                  <Text style={styles.toggleSub}>System alerts and pending request reminders</Text>
                </View>
                <Switch
                  value={pushAlerts}
                  onValueChange={setPushAlerts}
                  trackColor={{ false: Colors.border, true: Colors.actionBlue }}
                />
              </View>

              <Pressable style={styles.saveBtn} onPress={() => setActiveModal(null)}>
                <Text style={styles.saveBtnText}>Save Preferences</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 4: Help & Support */}
      <Modal
        visible={activeModal === "HELP"}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help & Support</Text>
              <Pressable onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.infoCard}>
                <Ionicons name="headset" size={24} color={Colors.actionBlue} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoCardTitle}>Internal IT Support Desk</Text>
                  <Text style={styles.infoCardText}>Toll Free: 1800-123-4567</Text>
                  <Text style={styles.infoCardText}>Email: support@enterprisebank.com</Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Ionicons name="book-outline" size={24} color={Colors.actionBlue} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoCardTitle}>Banking Officer Standard Guide</Text>
                  <Text style={styles.infoCardText}>SOP and transaction validation protocol v2.4</Text>
                </View>
              </View>

              <Pressable style={styles.saveBtn} onPress={() => setActiveModal(null)}>
                <Text style={styles.saveBtnText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavBar type="bank" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  mainWrapper: {
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    gap: 16,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.lightBlue,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  profileRole: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.actionBlue,
  },
  profileEmpId: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pressed: {
    opacity: 0.8,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.lightBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  optionSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logoutCard: {
    marginTop: 10,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  logoutLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.danger,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  modalForm: {
    gap: 14,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: "#FFFFFF",
  },
  disabledBox: {
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.lightBlue,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disabledText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.actionBlue,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#DCFCE7",
    borderRadius: 10,
  },
  successText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.success,
    flex: 1,
  },
  saveBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.actionBlue,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  toggleSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  timeoutRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  timeoutChip: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeoutChipActive: {
    backgroundColor: Colors.actionBlue,
    borderColor: Colors.actionBlue,
  },
  timeoutChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.actionBlue,
  },
  timeoutChipTextActive: {
    color: "#FFFFFF",
  },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.actionBlue,
    backgroundColor: "#FFFFFF",
    marginTop: 4,
  },
  outlineBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.actionBlue,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    backgroundColor: Colors.lightBlue,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  infoCardText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
