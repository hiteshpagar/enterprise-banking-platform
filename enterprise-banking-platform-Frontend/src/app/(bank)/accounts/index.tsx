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

export default function BankAccountsScreen() {
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchAccounts({ page: 0, size: 50 }, false);
      setAccounts(res.content || []);
      setTotalElements(res.totalElements || res.content?.length || 0);
    } catch (err) {
      console.error("Bank accounts load error", err);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeCount = accounts.filter(a => a.status === "ACTIVE").length;
  const inactiveCount = accounts.filter(a => a.status !== "ACTIVE").length;

  const filtered = accounts.filter(item => {
    const matchesSearch = item.accountNumber.includes(search) || item.customerName?.toLowerCase().includes(search.toLowerCase());
    if (filterTab === "ACTIVE") return matchesSearch && item.status === "ACTIVE";
    if (filterTab === "INACTIVE") return matchesSearch && item.status !== "ACTIVE";
    return matchesSearch;
  });

  const totalBalanceSum = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Accounts" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainWrapper}>
          {/* Search Row */}
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by account number or customer name"
              style={styles.searchInput}
            />
          </View>

          {/* Summary Cards Row */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Accounts</Text>
              <Text style={styles.summaryVal}>{totalElements}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Balance</Text>
              <Text style={styles.summaryVal}>₹{totalBalanceSum.toLocaleString("en-IN")}.00</Text>
            </View>
          </View>

          {/* Filter Segmented Tabs */}
          <View style={styles.segmentedContainer}>
            <Pressable
              style={[styles.segmentBtn, filterTab === "ALL" && styles.segmentBtnActive]}
              onPress={() => setFilterTab("ALL")}
            >
              <Text style={[styles.segmentText, filterTab === "ALL" && styles.segmentTextActive]}>
                All ({totalElements})
              </Text>
            </Pressable>
            <Pressable
              style={[styles.segmentBtn, filterTab === "ACTIVE" && styles.segmentBtnActive]}
              onPress={() => setFilterTab("ACTIVE")}
            >
              <Text style={[styles.segmentText, filterTab === "ACTIVE" && styles.segmentTextActive]}>
                Active ({activeCount})
              </Text>
            </Pressable>
            <Pressable
              style={[styles.segmentBtn, filterTab === "INACTIVE" && styles.segmentBtnActive]}
              onPress={() => setFilterTab("INACTIVE")}
            >
              <Text style={[styles.segmentText, filterTab === "INACTIVE" && styles.segmentTextActive]}>
                Inactive ({inactiveCount})
              </Text>
            </Pressable>
          </View>

          {/* Accounts List */}
          {isLoading ? (
            <ActivityIndicator color={Colors.actionBlue} size="large" style={{ marginVertical: 30 }} />
          ) : filtered.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="folder-open-outline" size={40} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>No accounts found</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {filtered.map((item) => {
                const isActive = item.status === "ACTIVE";
                return (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [styles.accountCard, pressed && styles.pressed]}
                    onPress={() => router.push(`/(bank)/accounts/${item.id}` as Href)}
                  >
                    <View style={styles.accLeft}>
                      <Text style={styles.accNum}>{item.accountNumber}</Text>
                      {item.customerName ? <Text style={styles.customerName}>{item.customerName}</Text> : null}
                      <Text style={styles.accType}>
                        {item.accountType === "SAVINGS" ? "Savings Account" : "Current Account"}
                      </Text>
                    </View>
                    <View style={styles.accRight}>
                      <Text style={styles.balance}>₹{(item.balance || 0).toLocaleString("en-IN")}.00</Text>
                      <View style={[styles.activePill, !isActive && styles.inactivePill]}>
                        <Text style={[styles.activePillText, !isActive && styles.inactivePillText]}>
                          {item.status || "ACTIVE"}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Create New Account Button */}
          <Pressable
            style={({ pressed }) => [styles.createBtn, pressed && styles.pressed]}
            onPress={() => router.push("/(bank)/accounts/new" as Href)}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
            <Text style={styles.createBtnText}>Create New Account</Text>
          </Pressable>
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#D5E3FF",
    fontWeight: "600",
  },
  summaryVal: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 4,
  },
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: Colors.lightBlue,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 9,
  },
  segmentBtnActive: {
    backgroundColor: "#FFFFFF",
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.actionBlue,
    fontWeight: "700",
  },
  list: {
    gap: 12,
    marginBottom: 20,
  },
  accountCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pressed: {
    opacity: 0.9,
  },
  accLeft: {
    flex: 1,
  },
  accNum: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  customerName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  accType: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  accRight: {
    alignItems: "flex-end",
  },
  balance: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.success,
  },
  activePill: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.success,
  },
  inactivePill: {
    backgroundColor: "#FEE2E2",
  },
  inactivePillText: {
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
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.actionBlue,
    marginTop: 8,
  },
  createBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
