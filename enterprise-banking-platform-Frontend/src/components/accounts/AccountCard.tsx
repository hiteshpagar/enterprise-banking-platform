import { Pressable, StyleSheet, Text, View } from "react-native";
import type { AccountSummary } from "../../types/account";
import { AccountStatusBadge } from "./AccountStatusBadge";

interface AccountCardProps {
  account: AccountSummary;
  onPress: (id: string) => void;
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(value);
}

function formatAccountType(accountType: string) {
  return accountType
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

export function AccountCard({
  account,
  onPress,
}: AccountCardProps) {
  return (
    <Pressable
      onPress={() => onPress(account.id)}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.accountMeta}>
          <Text style={styles.accountType}>
            {formatAccountType(account.accountType)}
          </Text>
          <Text style={styles.accountNumber}>
            {account.accountNumber}
          </Text>
        </View>

        <AccountStatusBadge status={account.status} />
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.label}>Customer</Text>
          <Text style={styles.customerName}>
            {account.customerName}
          </Text>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={styles.label}>Balance</Text>
          <Text style={styles.balance}>
            {formatCurrency(account.balance, account.currency)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 18,
    backgroundColor: "#FFFFFF",
  },
  cardPressed: {
    opacity: 0.86,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  accountMeta: {
    flex: 1,
    gap: 4,
  },
  accountType: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
  },
  accountNumber: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  label: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  customerName: {
    marginTop: 4,
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
  },
  balanceContainer: {
    alignItems: "flex-end",
  },
  balance: {
    marginTop: 4,
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
  },
});
