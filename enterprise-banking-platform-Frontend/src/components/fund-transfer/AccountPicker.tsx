import { Pressable, StyleSheet, Text, View } from "react-native";
import type { AccountSummary } from "@/types/account";
import { AccountStatusBadge } from "../accounts/AccountStatusBadge";

interface AccountPickerProps {
  accounts: AccountSummary[];
  selectedAccountId?: string;
  onSelect: (account: AccountSummary) => void;
}

export function AccountPicker({
  accounts,
  selectedAccountId,
  onSelect,
}: AccountPickerProps) {
  if (accounts.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No Accounts Found</Text>
        <Text style={styles.emptyText}>
          You do not have any active accounts to transfer money from.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Select Source Account</Text>
      {accounts.map((account) => {
        const isSelected = account.id === selectedAccountId;

        return (
          <Pressable
            key={account.id}
            onPress={() => onSelect(account)}
            style={[styles.card, isSelected && styles.selectedCard]}
          >
            <View style={styles.headerRow}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{account.accountType}</Text>
              </View>
              <AccountStatusBadge status={account.status} />
            </View>

            <View style={styles.mainRow}>
              <View>
                <Text style={styles.accountNumberText}>
                  {account.accountNumber}
                </Text>
                <Text style={styles.holderText}>{account.customerName}</Text>
              </View>

              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceValue}>
                  {account.currency}{" "}
                  {account.balance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            </View>

            {isSelected && (
              <View style={styles.selectedCheckRow}>
                <Text style={styles.selectedCheckText}>✓ Selected</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    gap: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCard: {
    borderColor: "#1D4ED8",
    backgroundColor: "#EFF6FF",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    color: "#1E40AF",
    fontSize: 12,
    fontWeight: "700",
  },
  mainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  accountNumberText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 0.5,
  },
  holderText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  balanceContainer: {
    alignItems: "flex-end",
  },
  balanceLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  balanceValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#059669",
    marginTop: 2,
  },
  selectedCheckRow: {
    borderTopWidth: 1,
    borderTopColor: "#BFDBFE",
    paddingTop: 8,
    alignItems: "flex-end",
  },
  selectedCheckText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  emptyState: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
});
