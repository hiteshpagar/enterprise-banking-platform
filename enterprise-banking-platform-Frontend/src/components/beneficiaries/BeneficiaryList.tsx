import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Beneficiary } from "@/types/beneficiary";
import { BeneficiaryCard } from "./BeneficiaryCard";

interface BeneficiaryListProps {
  beneficiaries: Beneficiary[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  error?: string;
  canLoadMore: boolean;
  onBeneficiaryPress: (id: string) => void;
  onRefresh: () => void;
  onLoadMore: () => void;
  onRetry: () => void;
}

export function BeneficiaryList({
  beneficiaries,
  isLoading,
  isLoadingMore,
  isRefreshing,
  error,
  canLoadMore,
  onBeneficiaryPress,
  onRefresh,
  onLoadMore,
  onRetry,
}: BeneficiaryListProps) {
  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text style={styles.stateText}>Loading beneficiaries...</Text>
      </View>
    );
  }

  if (error) {
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
      data={beneficiaries}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <BeneficiaryCard
          beneficiary={item}
          onPress={onBeneficiaryPress}
        />
      )}
      contentContainerStyle={styles.listContent}
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      onEndReached={() => {
        if (canLoadMore && !isLoadingMore) {
          onLoadMore();
        }
      }}
      onEndReachedThreshold={0.4}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No beneficiaries found</Text>
          <Text style={styles.emptyText}>
            Add a beneficiary to easily transfer funds.
          </Text>
        </View>
      }
      ListFooterComponent={
        isLoadingMore ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator color="#1D4ED8" />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    gap: 14,
    padding: 20,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  stateText: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 15,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 15,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#111827",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    marginTop: 6,
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
  },
  footerLoader: {
    paddingVertical: 16,
  },
});
