import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { AccountSummary } from "../../types/account";
import type { Beneficiary } from "../../types/beneficiary";

interface TransferReviewProps {
  sourceAccount: AccountSummary;
  beneficiary: Beneficiary;
  amount: number;
  description?: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function TransferReview({
  sourceAccount,
  beneficiary,
  amount,
  description,
  isSubmitting,
  onCancel,
  onConfirm,
}: TransferReviewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Review Transfer Details</Text>

      <View style={styles.card}>
        {/* FROM */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>From Account</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Holder</Text>
            <Text style={styles.value}>{sourceAccount.customerName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Account Number</Text>
            <Text style={styles.valueBold}>{sourceAccount.accountNumber}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Type & Currency</Text>
            <Text style={styles.value}>
              {sourceAccount.accountType} ({sourceAccount.currency})
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* TO */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>To Beneficiary</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Beneficiary Name</Text>
            <Text style={styles.valueBold}>{beneficiary.beneficiaryName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Destination Account</Text>
            <Text style={styles.valueBold}>{beneficiary.accountNumber}</Text>
          </View>
          {beneficiary.bankName ? (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Bank</Text>
              <Text style={styles.value}>{beneficiary.bankName}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.divider} />

        {/* TRANSFER DETAILS */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Transfer Amount</Text>
          <View style={styles.amountHighlightRow}>
            <Text style={styles.amountText}>
              {sourceAccount.currency}{" "}
              {amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>

          {description ? (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Description / Memo</Text>
              <Text style={styles.value}>{description}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.actionsRow}>
        <Pressable
          onPress={onCancel}
          disabled={isSubmitting}
          style={[styles.cancelButton, isSubmitting && styles.disabledButton]}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>

        <Pressable
          onPress={onConfirm}
          disabled={isSubmitting}
          style={[styles.confirmButton, isSubmitting && styles.disabledButton]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Transfer</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  block: {
    gap: 8,
  },
  blockTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  valueBold: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  amountHighlightRow: {
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginVertical: 4,
  },
  amountText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1D4ED8",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
  },
  confirmButton: {
    flex: 2,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
