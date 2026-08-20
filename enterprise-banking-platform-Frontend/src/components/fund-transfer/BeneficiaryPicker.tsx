import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Beneficiary } from "../../types/beneficiary";
import { BeneficiaryStatusBadge } from "../beneficiaries/BeneficiaryStatusBadge";

interface BeneficiaryPickerProps {
  beneficiaries: Beneficiary[];
  selectedBeneficiaryId?: string;
  onSelect: (beneficiary: Beneficiary) => void;
}

export function BeneficiaryPicker({
  beneficiaries,
  selectedBeneficiaryId,
  onSelect,
}: BeneficiaryPickerProps) {
  if (beneficiaries.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No Beneficiaries Found</Text>
        <Text style={styles.emptyText}>
          You must add a beneficiary before initiating a fund transfer.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Select Beneficiary</Text>
      {beneficiaries.map((beneficiary) => {
        const isSelected = beneficiary.id === selectedBeneficiaryId;

        return (
          <Pressable
            key={beneficiary.id}
            onPress={() => onSelect(beneficiary)}
            style={[styles.card, isSelected && styles.selectedCard]}
          >
            <View style={styles.headerRow}>
              <Text style={styles.nameText}>{beneficiary.beneficiaryName}</Text>
              <BeneficiaryStatusBadge status={beneficiary.status} />
            </View>

            <View style={styles.infoRow}>
              <View>
                <Text style={styles.label}>Account Number</Text>
                <Text style={styles.value}>{beneficiary.accountNumber}</Text>
              </View>

              {beneficiary.bankName ? (
                <View style={styles.alignRight}>
                  <Text style={styles.label}>Bank</Text>
                  <Text style={styles.value}>{beneficiary.bankName}</Text>
                </View>
              ) : null}
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
    borderColor: "#0F766E",
    backgroundColor: "#F0FDFA",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alignRight: {
    alignItems: "flex-end",
  },
  label: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  value: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 2,
  },
  selectedCheckRow: {
    borderTopWidth: 1,
    borderTopColor: "#99F6E4",
    paddingTop: 8,
    alignItems: "flex-end",
  },
  selectedCheckText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F766E",
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
