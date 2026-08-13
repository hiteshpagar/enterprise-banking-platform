import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { AccountSummary } from "../../types/account";
import { AccountCard } from "./AccountCard";

interface AccountListProps {
  accounts: AccountSummary[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  error: string;
  canLoadMore: boolean;
  onAccountPress: (id: string) => void;
  onRefresh: () => void;
  onLoadMore: () => void;
  onRetry: () => void;
}

export function AccountList({
  accounts,
  isLoading,
  isLoadingMore,
  isRefreshing,
  error,
  canLoadMore,
  onAccountPress,
  onRefresh,
  onLoadMore,
  onRetry,
}: AccountListProps) {
  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator />
        <Text style={styles.stateText}>Loading accounts</Text>
      </View>
    );
  }

  if (error && accounts.length === 0) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={accounts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <AccountCard
          account={item}
          onPress={onAccountPress}
        />
      )}
      contentContainerStyle={[
        styles.listContent,
        accounts.length === 0 && styles.emptyListContent,
      ]}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      onEndReached={() => {
        if (canLoadMore && !isLoadingMore) {
          onLoadMore();
        }
      }}
      onEndReachedThreshold={0.35}
      ListEmptyComponent={
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>No accounts found</Text>
          <Text style={styles.stateText}>
            Accounts will appear here once they are available.
          </Text>
        </View>
      }
      ListFooterComponent={
        isLoadingMore ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 20,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  separator: {
    height: 14,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  stateTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  stateText: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 15,
    textAlign: "center",
  },
  errorText: {
    color: "#991B1B",
    fontSize: 15,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#111827",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  footerLoader: {
    padding: 18,
  },
});
