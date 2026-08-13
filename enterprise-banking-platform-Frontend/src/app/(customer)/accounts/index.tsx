import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router, type Href } from "expo-router";
import { AccountList } from "../../../components/accounts/AccountList";
import { fetchAccounts } from "../../../services/accountService";
import type {
  AccountPage,
  AccountSummary,
} from "../../../types/account";

const PAGE_SIZE = 10;

export default function AccountsScreen() {
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [pageInfo, setPageInfo] = useState<AccountPage | null>(null);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadAccounts = useCallback(
    async (page: number, mode: "replace" | "append") => {
      setError("");

      if (mode === "replace") {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await fetchAccounts({
          page,
          size: PAGE_SIZE,
          sortBy: "accountNumber",
          search: submittedSearch.trim(),
        });

        setPageInfo(response);
        setAccounts((currentAccounts) =>
          mode === "append"
            ? [...currentAccounts, ...response.content]
            : response.content
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load accounts."
        );
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    },
    [submittedSearch]
  );

  useEffect(() => {
    loadAccounts(0, "replace");
  }, [loadAccounts]);

  function handleSubmitSearch() {
    setSubmittedSearch(search);
  }

  function handleClearSearch() {
    setSearch("");
    setSubmittedSearch("");
  }

  function handleRefresh() {
    setIsRefreshing(true);
    loadAccounts(0, "replace");
  }

  function handleLoadMore() {
    if (!pageInfo || pageInfo.last) {
      return;
    }

    loadAccounts(pageInfo.number + 1, "append");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>

          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Customer Accounts</Text>
            <Text style={styles.title}>Accounts</Text>
          </View>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search account number"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={handleSubmitSearch}
            style={styles.searchInput}
          />

          <Pressable
            onPress={handleSubmitSearch}
            style={styles.searchButton}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </Pressable>
        </View>

        {submittedSearch ? (
          <Pressable
            onPress={handleClearSearch}
            style={styles.clearSearchButton}
          >
            <Text style={styles.clearSearchText}>
              Clear search for {submittedSearch}
            </Text>
          </Pressable>
        ) : null}

        {pageInfo ? (
          <Text style={styles.resultCount}>
            {pageInfo.totalElements} account
            {pageInfo.totalElements === 1 ? "" : "s"}
          </Text>
        ) : null}
      </View>

      <AccountList
        accounts={accounts}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        isRefreshing={isRefreshing}
        error={error}
        canLoadMore={!!pageInfo && !pageInfo.last}
        onAccountPress={(id) =>
          router.push(`/accounts/${id}` as Href)
        }
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        onRetry={() => loadAccounts(0, "replace")}
      />
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
    paddingBottom: 18,
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
    fontSize: 28,
    fontWeight: "800",
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 14,
    color: "#111827",
    fontSize: 15,
    backgroundColor: "#FFFFFF",
  },
  searchButton: {
    minWidth: 86,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#111827",
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  clearSearchButton: {
    alignSelf: "flex-start",
  },
  clearSearchText: {
    color: "#1D4ED8",
    fontSize: 14,
    fontWeight: "700",
  },
  resultCount: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
  },
});
