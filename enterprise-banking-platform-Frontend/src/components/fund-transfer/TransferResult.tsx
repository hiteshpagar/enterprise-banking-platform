import { Pressable, StyleSheet, Text, View } from "react-native";
import type { TransferResponse } from "../../types/fundTransfer";
import type { AccountSummary } from "../../types/account";
import type { Beneficiary } from "../../types/beneficiary";

interface TransferResultProps {
  success: boolean;
  transferResponse?: TransferResponse | null;
  errorMessage?: string;
  sourceAccount?: AccountSummary | null;
  beneficiary?: Beneficiary | null;
  amount?: number;
  onGoToDashboard: () => void;
  onViewHistory: () => void;
  onNewTransfer: () => void;
}

export function TransferResult({
  success,
  transferResponse,
  errorMessage,
  sourceAccount,
  beneficiary,
  amount,
  onGoToDashboard,
  onViewHistory,
  onNewTransfer,
}: TransferResultProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View
          style={[
            styles.iconCircle,
            success ? styles.successIconBg : styles.failureIconBg,
          ]}
        >
          <Text style={styles.iconText}>{success ? "✓" : "✕"}</Text>
        </View>

        <Text style={styles.title}>
          {success ? "Transfer Successful!" : "Transfer Failed"}
        </Text>

        <Text style={styles.subtitle}>
          {success
            ? "Your money transfer has been processed successfully."
            : errorMessage || "An error occurred while processing the transfer."}
        </Text>

        {success && (
          <View style={styles.detailsBox}>
            {transferResponse?.transferReference ? (
              <View style={styles.detailRow}>
                <Text style={styles.label}>Reference Number</Text>
                <Text style={styles.referenceValue}>
                  {transferResponse.transferReference}
                </Text>
              </View>
            ) : null}

            <View style={styles.detailRow}>
              <Text style={styles.label}>Amount Transferred</Text>
              <Text style={styles.amountValue}>
                {transferResponse?.currency || sourceAccount?.currency || "USD"}{" "}
                {(transferResponse?.amount || amount || 0).toLocaleString(
                  "en-US",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>From Account</Text>
              <Text style={styles.value}>
                {transferResponse?.sourceAccountNumber ||
                  sourceAccount?.accountNumber}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>To Beneficiary</Text>
              <Text style={styles.value}>
                {beneficiary?.beneficiaryName} (
                {transferResponse?.destinationAccountNumber ||
                  beneficiary?.accountNumber}
                )
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {transferResponse?.status || "COMPLETED"}
                </Text>
              </View>
            </View>

            {transferResponse?.createdAt ? (
              <View style={styles.detailRow}>
                <Text style={styles.label}>Date & Time</Text>
                <Text style={styles.value}>
                  {new Date(transferResponse.createdAt).toLocaleString()}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.actionsColumn}>
          {success ? (
            <>
              <Pressable
                onPress={onViewHistory}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>
                  View Transaction History
                </Text>
              </Pressable>

              <Pressable
                onPress={onNewTransfer}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>
                  Make Another Transfer
                </Text>
              </Pressable>

              <Pressable onPress={onGoToDashboard} style={styles.textButton}>
                <Text style={styles.textButtonText}>Return to Dashboard</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable onPress={onNewTransfer} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </Pressable>

              <Pressable
                onPress={onGoToDashboard}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>
                  Return to Dashboard
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successIconBg: {
    backgroundColor: "#D1FAE5",
  },
  failureIconBg: {
    backgroundColor: "#FEE2E2",
  },
  iconText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#059669",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 12,
  },
  detailsBox: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    color: "#6B7280",
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  referenceValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1D4ED8",
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#059669",
  },
  statusBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    color: "#065F46",
    fontSize: 12,
    fontWeight: "700",
  },
  actionsColumn: {
    width: "100%",
    gap: 10,
    marginTop: 8,
  },
  primaryButton: {
    width: "100%",
    height: 48,
    borderRadius: 10,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    width: "100%",
    height: 48,
    borderRadius: 10,
    backgroundColor: "#EEF2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "700",
  },
  textButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  textButtonText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },
});
