import React, { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { router, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchAccounts } from "@/services/accountService";
import type { AccountSummary } from "@/types/account";
import { Colors } from "@/constants/theme";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { BottomNavBar } from "@/components/common/BottomNavBar";

export default function AccountsScreen() {
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchAccounts({
        page: 0,
        size: 20,
        search: submittedSearch.trim(),
      });
      setAccounts(response.content || []);
    } catch (err) {
      console.error("Accounts load error", err);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, [submittedSearch]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  return (
    <View style={styles.container}>
      <ScreenHeader title="My Accounts" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainWrapper}>
          {/* Total Balance Card */}
          <View style={styles.totalCard}>
            <View style={styles.totalCardContent}>
              <Text style={styles.totalLabel}>Total Balance</Text>
              <Text style={styles.totalAmount}>₹{totalBalance.toLocaleString("en-IN")}.00</Text>
            </View>
            <View style={styles.watermarkIcon}>
              <Ionicons name="business" size={90} color="rgba(255, 255, 255, 0.08)" />
            </View>
          </View>

          {/* Search bar */}
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search account number..."
              onSubmitEditing={() => setSubmittedSearch(search)}
              style={styles.searchInput}
            />
          </View>

          {/* Account Cards List */}
          <View style={styles.listSection}>
            {isLoading ? (
              <ActivityIndicator color={Colors.actionBlue} size="large" style={{ marginVertical: 20 }} />
            ) : accounts.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="wallet-outline" size={40} color={Colors.textSecondary} />
                <Text style={styles.emptyTitle}>No accounts found</Text>
              </View>
            ) : (
              accounts.map((acc) => {
                const isActive = acc.status === "ACTIVE";
                const isSavings = acc.accountType === "SAVINGS";
                return (
                  <Pressable
                    key={acc.id}
                    style={({ pressed }) => [styles.accountCard, pressed && styles.cardPressed]}
                    onPress={() => router.push(`/(customer)/accounts/${acc.id}` as Href)}
                  >
                    <View style={styles.accHeader}>
                      <View style={styles.accTypeBadge}>
                        <Ionicons
                          name={isSavings ? "wallet" : "card"}
                          size={18}
                          color={Colors.actionBlue}
                        />
                        <Text style={styles.accTypeName}>
                          {isSavings ? "Savings Account" : "Current Account"}
                        </Text>
                      </View>
                      <Text style={styles.accNumberMask}>•••• •••• {acc.accountNumber.slice(-4)}</Text>
                    </View>

                    <View style={styles.accBody}>
                      <View>
                        <Text style={styles.balanceHeading}>Available Balance</Text>
                        <Text style={styles.accBalance}>₹{(acc.balance || 0).toLocaleString("en-IN")}.00</Text>
                      </View>

                      <View style={[styles.activePill, !isActive && styles.inactivePill]}>
                        <View style={[styles.activeDot, !isActive && styles.inactiveDot]} />
                        <Text style={[styles.activeText, !isActive && styles.inactiveText]}>{acc.status}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

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
    paddingTop: 16,
  },
  totalCard: {
    backgroundColor: Colors.primaryBlue,
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    position: "relative",
    overflow: "hidden",
  },
  totalCardContent: {
    zIndex: 2,
  },
  totalLabel: {
    fontSize: 13,
    color: "#D5E3FF",
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 4,
  },
  watermarkIcon: {
    position: "absolute",
    right: -10,
    bottom: -15,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 18,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  listSection: {
    gap: 14,
    marginBottom: 20,
  },
  accountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  accHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  accTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  accTypeName: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  accNumberMask: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  accBody: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  balanceHeading: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  accBalance: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.actionBlue,
    marginTop: 2,
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inactivePill: {
    backgroundColor: "#FEE2E2",
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  inactiveDot: {
    backgroundColor: Colors.danger,
  },
  activeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.success,
  },
  inactiveText: {
    color: Colors.danger,
  },
  emptyCard: {
    padding: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
});
