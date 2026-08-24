import { StyleSheet, Text, View } from "react-native";
import type { CombinedActivityItem } from "@/types/transaction";

interface ActivityItemCardProps {
  item: CombinedActivityItem;
}

export function ActivityItemCard({ item }: ActivityItemCardProps) {
  const isCredit = item.kind === "DEPOSIT" || item.kind === "TRANSFER_IN";

  let title = "Transaction";
  if (item.kind === "DEPOSIT") title = "Deposit";
  else if (item.kind === "WITHDRAWAL") title = "Withdrawal";
  else if (item.kind === "TRANSFER_OUT") title = "Transfer Sent";
  else if (item.kind === "TRANSFER_IN") title = "Transfer Received";

  return (
    <View style={styles.card}>
      <View style={styles.leftRow}>
        <View
          style={[
            styles.iconContainer,
            isCredit ? styles.creditBg : styles.debitBg,
          ]}
        >
          <Text
            style={[
              styles.iconText,
              isCredit ? styles.creditText : styles.debitText,
            ]}
          >
            {isCredit ? "+" : "-"}
          </Text>
        </View>

        <View style={styles.infoColumn}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.reference}>{item.reference}</Text>

          {item.kind.startsWith("TRANSFER") && (
            <Text style={styles.transferDetails}>
              {item.kind === "TRANSFER_OUT"
                ? `To: ${item.destinationAccount || "N/A"}`
                : `From: ${item.sourceAccount || "N/A"}`}
            </Text>
          )}

          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </Text>
        </View>
      </View>

      <View style={styles.rightColumn}>
        <Text
          style={[
            styles.amount,
            isCredit ? styles.creditAmount : styles.debitAmount,
          ]}
        >
          {isCredit ? "+" : "-"}
          {item.currency}{" "}
          {item.amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>

        <View
          style={[
            styles.statusBadge,
            item.status === "COMPLETED"
              ? styles.completedBadge
              : item.status === "FAILED"
              ? styles.failedBadge
              : styles.pendingBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === "COMPLETED"
                ? styles.completedText
                : item.status === "FAILED"
                ? styles.failedText
                : styles.pendingText,
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  creditBg: {
    backgroundColor: "#D1FAE5",
  },
  debitBg: {
    backgroundColor: "#FEE2E2",
  },
  iconText: {
    fontSize: 20,
    fontWeight: "900",
  },
  creditText: {
    color: "#059669",
  },
  debitText: {
    color: "#DC2626",
  },
  infoColumn: {
    gap: 2,
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  reference: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
  },
  transferDetails: {
    fontSize: 12,
    color: "#6B7280",
  },
  dateText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  rightColumn: {
    alignItems: "flex-end",
    gap: 6,
  },
  amount: {
    fontSize: 15,
    fontWeight: "800",
  },
  creditAmount: {
    color: "#059669",
  },
  debitAmount: {
    color: "#DC2626",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  completedBadge: {
    backgroundColor: "#ECFDF5",
  },
  failedBadge: {
    backgroundColor: "#FEF2F2",
  },
  pendingBadge: {
    backgroundColor: "#FFFBEB",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  completedText: {
    color: "#047857",
  },
  failedText: {
    color: "#B91C1C",
  },
  pendingText: {
    color: "#B45309",
  },
});
