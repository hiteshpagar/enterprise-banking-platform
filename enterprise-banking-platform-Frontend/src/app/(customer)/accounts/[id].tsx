import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AccountStatusBadge } from "../../../components/accounts/AccountStatusBadge";
import { fetchAccountDetails } from "../../../services/accountService";
import type { Account } from "../../../types/account";

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function AccountDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadAccount() {
    if (!id) {
      setError("Account ID is missing.");
      setIsLoading(false);
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetchAccountDetails(id);
      setAccount(response);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load account details."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAccount();
  }, [id]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <Text style={styles.eyebrow}>Account Details</Text>
        <Text style={styles.title}>
          {account?.accountNumber ?? "Account"}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator />
          <Text style={styles.stateText}>Loading account details</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadAccount} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : account ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.balancePanel}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <AccountStatusBadge status={account.status} />
            </View>

            <Text style={styles.balance}>
              {formatCurrency(account.balance, account.currency)}
            </Text>
          </View>

          <View style={styles.section}>
            <DetailRow
              label="Account Type"
              value={formatLabel(account.accountType)}
            />
            <DetailRow
              label="Currency"
              value={account.currency}
            />
            <DetailRow
              label="Customer"
              value={account.customerName}
            />
            <DetailRow
              label="Customer ID"
              value={account.customerId}
            />
            <DetailRow
              label="Opened"
              value={formatDate(account.openedAt)}
            />
            <DetailRow
              label="Created"
              value={formatDate(account.createdAt)}
            />
            <DetailRow
              label="Updated"
              value={formatDate(account.updatedAt)}
            />
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 18,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    alignSelf: "flex-start",
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
  eyebrow: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "800",
  },
  content: {
    gap: 18,
    padding: 20,
  },
  balancePanel: {
    gap: 16,
    borderRadius: 8,
    padding: 20,
    backgroundColor: "#111827",
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  balanceLabel: {
    color: "#D1D5DB",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  balance: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
  },
  section: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  detailRow: {
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    padding: 16,
  },
  detailLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  detailValue: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  stateText: {
    marginTop: 8,
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
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#111827",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
