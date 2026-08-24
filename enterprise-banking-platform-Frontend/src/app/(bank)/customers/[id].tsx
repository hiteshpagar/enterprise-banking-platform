import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getCustomerById } from "@/api/customers";
import type { Customer } from "@/types/customer";
import { Colors } from "@/constants/theme";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { BottomNavBar } from "@/components/common/BottomNavBar";

export default function BankCustomerDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"Overview" | "Accounts" | "KYC" | "Documents" | "Activity">("Overview");

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCustomer() {
      if (!id) return;
      setIsLoading(true);
      setError("");
      try {
        const res = await getCustomerById(id);
        setCustomer(res);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to load customer details");
      } finally {
        setIsLoading(false);
      }
    }
    loadCustomer();
  }, [id]);

  const fullName = customer ? `${customer.firstName} ${customer.lastName}`.trim() : "";
  const initials = fullName.length >= 2 ? fullName.slice(0, 2).toUpperCase() : "C";

  const tabs = ["Overview", "Accounts", "KYC", "Documents", "Activity"] as const;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Customer Details" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainWrapper}>
          {isLoading ? (
            <ActivityIndicator color={Colors.actionBlue} size="large" style={{ marginVertical: 30 }} />
          ) : error || !customer ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={24} color={Colors.danger} />
              <Text style={styles.errorText}>{error || "Customer not found"}</Text>
            </View>
          ) : (
            <>
              {/* Top Profile Card */}
              <View style={styles.profileCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{fullName}</Text>
                  <Text style={styles.profileSub}>{customer.customerNumber}</Text>
                </View>
                <View style={[styles.activeBadge, customer.status !== "ACTIVE" && styles.inactiveBadge]}>
                  <Text style={[styles.activeBadgeText, customer.status !== "ACTIVE" && styles.inactiveBadgeText]}>
                    {customer.status}
                  </Text>
                </View>
              </View>

              {/* Sub Navigation Tabs */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
                <View style={styles.tabsRow}>
                  {tabs.map((tab) => (
                    <Pressable
                      key={tab}
                      style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                      onPress={() => setActiveTab(tab)}
                    >
                      <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                        {tab}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              {/* Personal Information Card */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Personal Information</Text>

                {customer.mobileNumber ? (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Mobile Number</Text>
                      <Text style={styles.detailVal}>{customer.mobileNumber}</Text>
                    </View>
                    <View style={styles.divider} />
                  </>
                ) : null}

                {customer.email ? (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Email</Text>
                      <Text style={styles.detailVal}>{customer.email}</Text>
                    </View>
                    <View style={styles.divider} />
                  </>
                ) : null}

                {customer.dateOfBirth ? (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date of Birth</Text>
                      <Text style={styles.detailVal}>{customer.dateOfBirth}</Text>
                    </View>
                    <View style={styles.divider} />
                  </>
                ) : null}

                {customer.gender ? (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Gender</Text>
                      <Text style={styles.detailVal}>{customer.gender}</Text>
                    </View>
                    <View style={styles.divider} />
                  </>
                ) : null}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Customer Since</Text>
                  <Text style={styles.detailVal}>
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("en-IN") : "-"}
                  </Text>
                </View>
              </View>

              {/* Bottom Action Buttons */}
              <View style={styles.actionButtonsRow}>
                <Pressable style={styles.primaryActionBtn}>
                  <Text style={styles.primaryActionText}>Edit Customer</Text>
                </Pressable>
                <Pressable style={styles.secondaryActionBtn}>
                  <Text style={styles.secondaryActionText}>More Actions</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>

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
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.actionBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  profileSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.success,
  },
  inactiveBadge: {
    backgroundColor: "#FEE2E2",
  },
  inactiveBadgeText: {
    color: Colors.danger,
  },
  tabsScroll: {
    marginBottom: 16,
  },
  tabsRow: {
    flexDirection: "row",
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBtnActive: {
    backgroundColor: Colors.actionBlue,
    borderColor: Colors.actionBlue,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  detailVal: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  primaryActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.actionBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.actionBlue,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionText: {
    color: Colors.actionBlue,
    fontSize: 15,
    fontWeight: "700",
  },
  errorBox: {
    padding: 24,
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.danger,
    fontWeight: "600",
  },
});
