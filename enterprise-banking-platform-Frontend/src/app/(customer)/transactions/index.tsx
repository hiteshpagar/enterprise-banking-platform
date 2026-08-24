import React, { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchAccounts } from "@/services/accountService";
import { fetchCombinedAccountActivity, fetchTransactions } from "@/services/transactionService";
import { Colors } from "@/constants/theme";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { BottomNavBar } from "@/components/common/BottomNavBar";

interface TransactionItem {
  id: string;
  type: "CREDIT" | "DEBIT";
  title: string;
  date: string;
  amount: number;
}

export default function CustomerTransactionsScreen() {
  const [filter, setFilter] = useState<"ALL" | "CREDIT" | "DEBIT">("ALL");
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const accRes = await fetchAccounts({ page: 0, size: 20 });
      const customerAccounts = accRes.content || [];
      const parsedItems: TransactionItem[] = [];

      if (customerAccounts.length > 0) {
        const activityPromises = customerAccounts.map((acc) =>
          fetchCombinedAccountActivity(acc.id, acc.accountNumber, 0, 50)
        );
        const results = await Promise.allSettled(activityPromises);

        results.forEach((res) => {
          if (res.status === "fulfilled" && res.value.items) {
            res.value.items.forEach((item) => {
              const isCredit = item.kind === "DEPOSIT" || item.kind === "TRANSFER_IN";
              parsedItems.push({
                id: item.id,
                type: isCredit ? "CREDIT" : "DEBIT",
                title: item.reference || (isCredit ? "Deposit / Received" : "Fund Transfer"),
                date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "",
                amount: item.amount,
              });
            });
          }
        });
      }

      if (parsedItems.length === 0) {
        const fallbackRes = await fetchTransactions({ page: 0, size: 50 });
        if (fallbackRes.content?.length) {
          fallbackRes.content.forEach((t) => {
            const isCredit = t.transactionType === "DEPOSIT";
            parsedItems.push({
              id: t.id,
              type: isCredit ? "CREDIT" : "DEBIT",
              title: t.transactionReference || (isCredit ? "Deposit" : "Withdrawal"),
              date: t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-IN") : "",
              amount: t.amount,
            });
          });
        }
      }

      setItems(parsedItems);
      setTotalElements(parsedItems.length);
    } catch (err) {
      console.error("Transaction history load error", err);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredItems = items.filter((item) => {
    if (filter === "CREDIT") return item.type === "CREDIT";
    if (filter === "DEBIT") return item.type === "DEBIT";
    return true;
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Transaction History" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainWrapper}>
          {/* Segmented Filter Pills */}
          <View style={styles.segmentedContainer}>
            {(["ALL", "CREDIT", "DEBIT"] as const).map((tab) => (
              <Pressable
                key={tab}
                style={[styles.segmentBtn, filter === tab && styles.segmentBtnActive]}
                onPress={() => setFilter(tab)}
              >
                <Text style={[styles.segmentText, filter === tab && styles.segmentTextActive]}>
                  {tab === "ALL" ? "All" : tab === "CREDIT" ? "Credit" : "Debit"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Transactions List */}
          {isLoading ? (
            <ActivityIndicator color={Colors.actionBlue} size="large" style={{ marginVertical: 30 }} />
          ) : filteredItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={40} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>No transaction history found</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {filteredItems.map((item, idx) => {
                const isCredit = item.type === "CREDIT";
                return (
                  <View key={item.id || idx} style={styles.txCard}>
                    <View style={[styles.iconBadge, isCredit ? styles.creditBadge : styles.debitBadge]}>
                      <Ionicons
                        name={isCredit ? "arrow-down" : "arrow-up"}
                        size={20}
                        color={isCredit ? Colors.success : Colors.danger}
                      />
                    </View>

                    <View style={styles.txDetails}>
                      <Text style={styles.txTitle} numberOfLines={1} ellipsizeMode="middle">
                        {item.title}
                      </Text>
                      <Text style={styles.txDate}>{item.date}</Text>
                    </View>

                    <Text style={[styles.txAmount, isCredit ? styles.creditAmount : styles.debitAmount]}>
                      {isCredit ? "+" : "-"} ₹{item.amount.toLocaleString("en-IN")}.00
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {filteredItems.length > 0 ? (
            <Text style={styles.footerCount}>
              Showing 1 - {filteredItems.length} of {totalElements || filteredItems.length} transactions
            </Text>
          ) : null}
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
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: Colors.lightBlue,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
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
    marginBottom: 20,
  },
  txCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconBadge: {
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
  txAmount: {
    fontSize: 15,
    fontWeight: "800",
  },
  creditAmount: {
    color: Colors.success,
  },
  debitAmount: {
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
  footerCount: {
    textAlign: "center",
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginTop: 10,
  },
});
