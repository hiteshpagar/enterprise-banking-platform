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
import { Ionicons } from "@expo/vector-icons";
import { fetchTransactions } from "@/services/transactionService";
import type { TransactionSummary } from "@/types/transaction";
import { Colors } from "@/constants/theme";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { BottomNavBar } from "@/components/common/BottomNavBar";

export default function BankTransactionsScreen() {
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "CREDIT" | "DEBIT">("ALL");

  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchTransactions({ page: 0, size: 50 });
      setTransactions(res.content || []);
    } catch (err) {
      console.error("Bank transactions load error", err);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const items = transactions.map((t) => ({
    id: t.transactionReference || t.id,
    type: t.transactionType === "DEPOSIT" ? "Deposit" : "Withdrawal",
    date: t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-IN") : "",
    isCredit: t.transactionType === "DEPOSIT",
    amount: t.amount,
    accNum: t.accountNumber || "",
  }));

  const filtered = items.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(search.toLowerCase()) || t.accNum.includes(search);
    if (filterTab === "CREDIT") return matchesSearch && t.isCredit;
    if (filterTab === "DEBIT") return matchesSearch && !t.isCredit;
    return matchesSearch;
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Transactions" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainWrapper}>
          {/* Search Row */}
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by account number or reference ID"
              style={styles.searchInput}
            />
          </View>

          {/* Segmented Filter Pills */}
          <View style={styles.segmentedContainer}>
            <Pressable
              style={[styles.segmentBtn, filterTab === "ALL" && styles.segmentBtnActive]}
              onPress={() => setFilterTab("ALL")}
            >
              <Text style={[styles.segmentText, filterTab === "ALL" && styles.segmentTextActive]}>
                All
              </Text>
            </Pressable>
            <Pressable
              style={[styles.segmentBtn, filterTab === "CREDIT" && styles.segmentBtnActive]}
              onPress={() => setFilterTab("CREDIT")}
            >
              <Text style={[styles.segmentText, filterTab === "CREDIT" && styles.segmentTextActive]}>
                Credit
              </Text>
            </Pressable>
            <Pressable
              style={[styles.segmentBtn, filterTab === "DEBIT" && styles.segmentBtnActive]}
              onPress={() => setFilterTab("DEBIT")}
            >
              <Text style={[styles.segmentText, filterTab === "DEBIT" && styles.segmentTextActive]}>
                Debit
              </Text>
            </Pressable>
          </View>

          {/* Transaction List */}
          {isLoading ? (
            <ActivityIndicator color={Colors.actionBlue} size="large" style={{ marginVertical: 30 }} />
          ) : filtered.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={40} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>No transactions found</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {filtered.map((item, idx) => (
                <View key={idx} style={styles.card}>
                  <View style={[styles.badge, item.isCredit ? styles.creditBadge : styles.debitBadge]}>
                    <Ionicons
                      name={item.isCredit ? "arrow-down" : "arrow-up"}
                      size={20}
                      color={item.isCredit ? Colors.success : Colors.danger}
                    />
                  </View>

                  <View style={styles.info}>
                    <Text style={styles.txnId}>{item.id}</Text>
                    <Text style={styles.txnType}>{item.type} {item.accNum ? `(${item.accNum})` : ""}</Text>
                    <Text style={styles.txnDate}>{item.date}</Text>
                  </View>

                  <Text style={[styles.amount, item.isCredit ? styles.creditText : styles.debitText]}>
                    {item.isCredit ? "+" : "-"} ₹{item.amount.toLocaleString("en-IN")}.00
                  </Text>
                </View>
              ))}
            </View>
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
    paddingVertical: 0,
    height: "100%",
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
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 9,
  },
  segmentBtnActive: {
    backgroundColor: Colors.actionBlue,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  creditBadge: {
    backgroundColor: "#DCFCE7",
  },
  debitBadge: {
    backgroundColor: "#FEE2E2",
  },
  info: {
    flex: 1,
  },
  txnId: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  txnType: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  txnDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: "800",
  },
  creditText: {
    color: Colors.success,
  },
  debitText: {
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
