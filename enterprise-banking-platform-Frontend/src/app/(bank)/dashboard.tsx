import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
} from "react-native";
import { router, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { Colors } from "@/constants/theme";
import { MetricCard } from "@/components/common/MetricCard";
import { QuickActionButton } from "@/components/common/QuickActionButton";
import { BottomNavBar } from "@/components/common/BottomNavBar";
import { SidebarDrawer } from "@/components/common/SidebarDrawer";
import { fetchCustomers } from "@/services/customerService";
import { fetchAccounts } from "@/services/accountService";
import type { AccountSummary } from "@/types/account";

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "Good Morning,";
  } else if (hour >= 12 && hour < 17) {
    return "Good Afternoon,";
  } else {
    return "Good Evening,";
  }
}

function formatRoleName(role?: string): string {
  if (!role) return "Bank Officer";
  const cleaned = role.replace(/^ROLE_/, "").replace(/_/g, " ");
  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default function BankDashboard() {
  const { user, logout } = useAuth();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
  const [totalAccountsCount, setTotalAccountsCount] = useState<number | null>(null);
  const [recentAccounts, setRecentAccounts] = useState<AccountSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBankData() {
      setIsLoading(true);
      try {
        const [custRes, accRes] = await Promise.allSettled([
          fetchCustomers({ page: 0, size: 1 }),
          fetchAccounts({ page: 0, size: 5 }, false),
        ]);

        if (custRes.status === "fulfilled") {
          setTotalCustomers(custRes.value.totalElements ?? null);
        }
        if (accRes.status === "fulfilled") {
          setTotalAccountsCount(accRes.value.totalElements ?? null);
          setRecentAccounts(accRes.value.content || []);
        }
      } catch (err) {
        console.error("Bank dashboard load error", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBankData();
  }, []);

  const userName = user?.username || "";
  const rawRole = user?.roles?.length ? user.roles[0] : "Bank Officer";
  const formattedRole = formatRoleName(rawRole);

  const totalDepositAmount = recentAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainWrapper}>
          {/* Header Bar */}
          <View style={styles.topHeader}>
            <View style={styles.headerLeft}>
              <Pressable style={styles.drawerButton} onPress={() => setDrawerVisible(true)}>
                <Ionicons name="menu" size={24} color={Colors.primary} />
              </Pressable>
              <View style={styles.greetingWrapper}>
                <Text style={styles.greetingTitle}>{getTimeGreeting()}</Text>
                <View style={styles.userRow}>
                  <Text style={styles.userNameText}>{userName}</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.userRoleText}>{formattedRole}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.headerRight}>
              <Pressable style={styles.iconCircle}>
                <Ionicons name="notifications-outline" size={20} color={Colors.textPrimary} />
              </Pressable>
            </View>
          </View>

          {/* Metric Overview Grid (2x2) */}
          <View style={styles.metricGrid}>
            <View style={styles.metricRow}>
              <MetricCard
                label="Total Customers"
                value={totalCustomers !== null ? totalCustomers.toLocaleString("en-IN") : "-"}
                icon="people"
                variant="blue"
                onPress={() => router.push("/(bank)/customers" as Href)}
              />
              <MetricCard
                label="Total Accounts"
                value={totalAccountsCount !== null ? totalAccountsCount.toLocaleString("en-IN") : "-"}
                icon="folder-open"
                variant="blue"
                onPress={() => router.push("/(bank)/accounts" as Href)}
              />
            </View>
            <View style={styles.metricRow}>
              <MetricCard
                label="Sample Balance Sum"
                value={`₹${totalDepositAmount.toLocaleString("en-IN")}.00`}
                icon="wallet"
                variant="dark"
              />
              <MetricCard
                label="Total Loans"
                value="-"
                icon="cash"
                variant="dark"
              />
            </View>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            <QuickActionButton
              label="Add Customer"
              icon="person-add"
              onPress={() => router.push("/(bank)/customers/new" as Href)}
            />
            <QuickActionButton
              label="Create Account"
              icon="add-circle"
              onPress={() => router.push("/(bank)/accounts/new" as Href)}
            />
            <QuickActionButton
              label="Fund Transfer"
              icon="swap-horizontal"
              onPress={() => router.push("/(bank)/fund-transfer" as Href)}
            />
            <QuickActionButton
              label="Reports"
              icon="bar-chart"
              onPress={() => router.push("/(bank)/reports" as Href)}
            />
          </View>

          {/* Recent Accounts / Activities */}
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Accounts</Text>
            <Pressable onPress={() => router.push("/(bank)/accounts" as Href)}>
              <Text style={styles.viewAllText}>View All</Text>
            </Pressable>
          </View>

          <View style={styles.activityList}>
            {isLoading ? (
              <ActivityIndicator color={Colors.actionBlue} size="large" style={{ marginVertical: 14 }} />
            ) : recentAccounts.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No recent accounts found</Text>
              </View>
            ) : (
              recentAccounts.map((acc) => (
                <View key={acc.id} style={styles.activityCard}>
                  <View style={[styles.activityIconCircle, { backgroundColor: Colors.lightBlue }]}>
                    <Ionicons name="card-outline" size={20} color={Colors.actionBlue} />
                  </View>
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityTitle}>{acc.customerName || `Account ${acc.accountNumber}`}</Text>
                    <Text style={styles.activitySub}>{acc.accountType} • {acc.accountNumber}</Text>
                  </View>
                  <Text style={styles.activityTime}>₹{(acc.balance || 0).toLocaleString("en-IN")}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Slide-out Menu Drawer */}
      <SidebarDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        user={{ name: userName, role: formattedRole }}
        onLogout={logout}
      />

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
    paddingTop: 50,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  drawerButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  greetingWrapper: {
    justifyContent: "center",
  },
  greetingTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  roleBadge: {
    backgroundColor: Colors.lightBlue,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  userRoleText: {
    fontSize: 11,
    color: Colors.actionBlue,
    fontWeight: "700",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricGrid: {
    gap: 12,
    marginBottom: 24,
  },
  metricRow: {
    flexDirection: "row",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  quickGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.actionBlue,
  },
  activityList: {
    gap: 12,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  activitySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  emptyCard: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
