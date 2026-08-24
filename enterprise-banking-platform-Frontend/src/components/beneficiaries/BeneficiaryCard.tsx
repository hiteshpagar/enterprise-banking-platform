import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Beneficiary } from "@/types/beneficiary";
import { BeneficiaryStatusBadge } from "./BeneficiaryStatusBadge";

interface BeneficiaryCardProps {
  beneficiary: Beneficiary;
  onPress: (id: string) => void;
}

export function BeneficiaryCard({
  beneficiary,
  onPress,
}: BeneficiaryCardProps) {
  return (
    <Pressable
      onPress={() => onPress(beneficiary.id)}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.meta}>
          <Text style={styles.name}>{beneficiary.beneficiaryName}</Text>
          <Text style={styles.bank}>{beneficiary.bankName || "Bank"}</Text>
        </View>

        <BeneficiaryStatusBadge status={beneficiary.status} />
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.label}>Account Number</Text>
          <Text style={styles.accountNumber}>{beneficiary.accountNumber}</Text>
        </View>

        <View style={styles.actionPrompt}>
          <Text style={styles.viewDetailsText}>View Details &rarr;</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
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
  meta: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
  },
  bank: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  label: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  accountNumber: {
    marginTop: 4,
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  actionPrompt: {
    alignItems: "flex-end",
  },
  viewDetailsText: {
    color: "#1D4ED8",
    fontSize: 13,
    fontWeight: "700",
  },
});
