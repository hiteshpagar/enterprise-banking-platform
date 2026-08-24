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
import { QuickActionButton } from "@/components/common/QuickActionButton";
import { BottomNavBar } from "@/components/common/BottomNavBar";
import { fetchAccounts } from "@/services/accountService";
import { fetchCombinedAccountActivity, fetchTransactions } from "@/services/transactionService";
import type { AccountSummary } from "@/types/account";
import type { TransactionSummary } from "@/types/transaction";

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

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const [hideBalance, setHideBalance] = useState(false);

  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const accRes = await fetchAccounts({ page: 0, size: 20 });
        const accList = accRes.content || [];
        setAccounts(accList);

        if (accList.length > 0) {
          const activityRes = await fetchCombinedAccountActivity(accList[0].id, accList[0].accountNumber, 0, 5);
          if (activityRes.items?.length) {
            setTransactions(
              activityRes.items.map((item) => ({
                id: item.id,
                transactionReference: item.reference || item.id,
                accountId: accList[0].id,
                accountNumber: item.sourceAccount || accList[0].accountNumber,
                transactionType: item.kind === "DEPOSIT" || item.kind === "TRANSFER_IN" ? "DEPOSIT" : "WITHDRAWAL",
                amount: item.amount,
                currency: item.currency,
                status: item.status,
                createdAt: item.createdAt,
              }))
            );
          } else {
            const txRes = await fetchTransactions({ page: 0, size: 5 });
            setTransactions(txRes.content || []);
          }
        }
      } catch (err) {
        console.error("Dashboard data load error", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const primaryAccount = accounts[0];
  const maskedAccountNumber = primaryAccount
    ? `•••• •••• ${primaryAccount.accountNumber.slice(-4)}`
    : "";

  const userName = user?.username || "";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainWrapper}>
          {/* Header Bar */}
          <View style={styles.topHeader}>
            <View>
              <Text style={styles.greetingTitle}>{getTimeGreeting()}</Text>
              <Text style={styles.userNameText}>{userName}</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable style={styles.headerIconButton}>
                <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
              </Pressable>
              <Pressable style={styles.headerIconButton} onPress={logout}>
                <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
              </Pressable>
            </View>
          </View>

          {/* Navy Balance Card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceCardHeader}>
              <View>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                {maskedAccountNumber ? (
                  <Text style={styles.accountMaskNumber}>{maskedAccountNumber}</Text>
                ) : null}
              </View>
              <Pressable
                onPress={() => setHideBalance(!hideBalance)}
                style={styles.eyeToggleButton}
              >
                <Ionicons
                  name={hideBalance ? "eye-off" : "eye"}
                  size={20}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>

            <View style={styles.balanceRow}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.balanceAmount}>
                  {hideBalance ? "₹ ••••••••" : `₹${totalBalance.toLocaleString("en-IN")}.00`}
                </Text>
              )}
            </View>

            {/* Background Vector Watermark Icon */}
            <View style={styles.bankWatermark}>
              <Ionicons name="business" size={110} color="rgba(255, 255, 255, 0.06)" />
            </View>
          </View>

          {/* Quick Actions Grid */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            <QuickActionButton
              label="Transfer Money"
              icon="swap-horizontal"
              onPress={() => router.push("/(customer)/fund-transfer" as Href)}
            />
            <QuickActionButton
              label="Beneficiaries"
              icon="people"
              onPress={() => router.push("/(customer)/beneficiaries" as Href)}
            />
            <QuickActionButton
              label="My Accounts"
              icon="wallet"
              onPress={() => router.push("/(customer)/accounts" as Href)}
            />
            <QuickActionButton
              label="Transactions"
              icon="receipt"
              onPress={() => router.push("/(customer)/transactions" as Href)}
            />
          </View>

          {/* Recent Transactions */}
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <Pressable onPress={() => router.push("/(customer)/transactions" as Href)}>
              <Text style={styles.viewAllText}>View All</Text>
            </Pressable>
          </View>

          <View style={styles.transactionList}>
            {isLoading ? (
              <ActivityIndicator color={Colors.actionBlue} size="large" style={{ marginVertical: 14 }} />
            ) : transactions.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No recent transactions</Text>
              </View>
            ) : (
              transactions.map((tx) => {
                const isCredit = tx.transactionType === "DEPOSIT";
                return (
                  <View key={tx.id} style={styles.transactionCard}>
                    <View style={[styles.txIconContainer, isCredit ? styles.txCreditIcon : styles.txDebitIcon]}>
                      <Ionicons
                        name={isCredit ? "arrow-down" : "arrow-up"}
                        size={20}
                        color={isCredit ? Colors.success : Colors.danger}
                      />
                    </View>
                    <View style={styles.txDetails}>
                      <Text style={styles.txTitle} numberOfLines={1} ellipsizeMode="middle">
                        {tx.transactionReference || "Transaction"}
                      </Text>
                      <Text style={styles.txDate}>
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("en-IN") : ""}
                      </Text>
                    </View>
                    <Text style={isCredit ? styles.txAmountCredit : styles.txAmountDebit}>
                      {isCredit ? "+" : "-"} ₹{tx.amount.toLocaleString("en-IN")}.00
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Integrated Customer Navigation Bar */}
      <BottomNavBar type="customer" />
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
  greetingTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  userNameText: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#0B1D3A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  balanceCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 13,
    color: "#D5E3FF",
    fontWeight: "600",
  },
  accountMaskNumber: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  eyeToggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceRow: {
    marginTop: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  bankWatermark: {
    position: "absolute",
    right: -10,
    bottom: -20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  quickGrid: {
    flexDirection: "row",
    gap: 12,
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
  transactionList: {
    gap: 12,
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  txIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  txCreditIcon: {
    backgroundColor: "#DCFCE7",
  },
  txDebitIcon: {
    backgroundColor: "#FEE2E2",
  },
  txDetails: {
    flex: 1,
    marginRight: 8,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  txDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  txAmountCredit: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.success,
  },
  txAmountDebit: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.danger,
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
