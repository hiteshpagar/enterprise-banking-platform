import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import { fetchAccounts } from "../../../services/accountService";
import { fetchCombinedAccountActivity } from "../../../services/transactionService";

import type { AccountSummary } from "../../../types/account";
import type { CombinedActivityItem } from "../../../types/transaction";
import { ActivityItemCard } from "../../../components/transactions/ActivityItemCard";

export default function TransactionHistoryScreen() {
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountSummary | null>(null);

  const [filterType, setFilterType] = useState<"ALL" | "TRANSFERS" | "DEPOSITS" | "WITHDRAWALS">("ALL");

  const [activityItems, setActivityItems] = useState<CombinedActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAccounts = useCallback(async () => {
    try {
      const accResponse = await fetchAccounts({ page: 0, size: 50 }, true);
      const active = accResponse.content;
      setAccounts(active);
      if (active.length > 0) {
        setSelectedAccount(active[0]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load customer accounts."
      );
    }
  }, []);

  const loadActivity = useCallback(async () => {
    if (!selectedAccount) return;

    setError("");
    setIsLoading(true);

    try {
      const result = await fetchCombinedAccountActivity(
        selectedAccount.id,
        selectedAccount.accountNumber,
        0,
        20
      );

      setActivityItems(result.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load transaction history."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedAccount]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    if (selectedAccount) {
      loadActivity();
    }
  }, [selectedAccount, loadActivity]);

  function handleRefresh() {
    setIsRefreshing(true);
    loadActivity();
  }

  const filteredItems = activityItems.filter((item) => {
    if (filterType === "TRANSFERS") {
      return item.kind === "TRANSFER_OUT" || item.kind === "TRANSFER_IN";
    }
    if (filterType === "DEPOSITS") {
      return item.kind === "DEPOSIT";
    }
    if (filterType === "WITHDRAWALS") {
      return item.kind === "WITHDRAWAL";
    }
    return true;
  });

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>

          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Activity</Text>
            <Text style={styles.title}>Transaction History</Text>
          </View>
        </View>

        {/* ACCOUNT SELECTION PILLS */}
        {accounts.length > 0 && (
          <View style={styles.accountSelectorWrapper}>
            <Text style={styles.selectorLabel}>Account:</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={accounts}
              keyExtractor={(acc) => acc.id}
              contentContainerStyle={styles.pillsContainer}
              renderItem={({ item: acc }) => {
                const isSelected = acc.id === selectedAccount?.id;
                return (
                  <Pressable
                    onPress={() => setSelectedAccount(acc)}
                    style={[
                      styles.accountPill,
                      isSelected && styles.selectedAccountPill,
                    ]}
                  >
                    <Text
                      style={[
                        styles.accountPillText,
                        isSelected && styles.selectedAccountPillText,
                      ]}
                    >
                      {acc.accountNumber} ({acc.currency} {acc.balance.toFixed(2)})
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        )}

        {/* FILTER TABS */}
        <View style={styles.filterRow}>
          {(["ALL", "TRANSFERS", "DEPOSITS", "WITHDRAWALS"] as const).map(
            (tab) => {
              const isSelected = filterType === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setFilterType(tab)}
                  style={[styles.filterTab, isSelected && styles.selectedFilterTab]}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      isSelected && styles.selectedFilterTabText,
                    ]}
                  >
                    {tab}
                  </Text>
                </Pressable>
              );
            }
          )}
        </View>
      </View>

      {/* CONTENT LIST */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1D4ED8" />
          <Text style={styles.loadingText}>Fetching activity...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadActivity} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#1D4ED8"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Activity Found</Text>
              <Text style={styles.emptySubtitle}>
                There are no transactions or transfers recorded for this filter.
              </Text>
            </View>
          }
          renderItem={({ item }) => <ActivityItemCard item={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  backButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#EEF2F7",
  },
  backButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    marginTop: 2,
    color: "#111827",
    fontSize: 26,
    fontWeight: "800",
  },
  accountSelectorWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectorLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },
  pillsContainer: {
    gap: 8,
  },
  accountPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedAccountPill: {
    backgroundColor: "#1D4ED8",
    borderColor: "#1D4ED8",
  },
  accountPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
  },
  selectedAccountPillText: {
    color: "#FFFFFF",
  },
  filterRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  selectedFilterTab: {
    backgroundColor: "#1E293B",
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6B7280",
  },
  selectedFilterTabText: {
    color: "#FFFFFF",
  },
  listContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#DC2626",
  },
  errorText: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#1D4ED8",
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 20,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
});
