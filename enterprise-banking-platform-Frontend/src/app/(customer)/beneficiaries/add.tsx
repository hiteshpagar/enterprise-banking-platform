import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { fetchAccounts } from "../../../services/accountService";
import { addCustomerBeneficiary } from "../../../services/beneficiaryService";
import type { AccountSummary } from "../../../types/account";

export default function AddBeneficiaryScreen() {
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAccounts() {
      try {
        const response = await fetchAccounts({ page: 0, size: 50 }, true);
        setAccounts(response.content);
        if (response.content.length > 0) {
          setSelectedAccountId(response.content[0].id);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load customer accounts."
        );
      } finally {
        setIsLoadingAccounts(false);
      }
    }

    loadAccounts();
  }, []);

  async function handleSubmit() {
    if (!selectedAccountId) {
      setError("Please select a linked account.");
      return;
    }
    if (!beneficiaryName.trim()) {
      setError("Beneficiary name is required.");
      return;
    }
    if (!accountNumber.trim()) {
      setError("Account number is required.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await addCustomerBeneficiary({
        accountId: selectedAccountId,
        beneficiaryName: beneficiaryName.trim(),
        bankName: bankName.trim() || undefined,
        accountNumber: accountNumber.trim(),
      });

      router.back();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add beneficiary."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Cancel</Text>
        </Pressable>
        <Text style={styles.eyebrow}>New Beneficiary</Text>
        <Text style={styles.title}>Add Beneficiary</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Select Your Linked Account</Text>
          {isLoadingAccounts ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#1D4ED8" />
              <Text style={styles.loadingText}>Loading your accounts...</Text>
            </View>
          ) : accounts.length === 0 ? (
            <Text style={styles.helperText}>
              No active accounts found for your profile.
            </Text>
          ) : (
            <View style={styles.accountPicker}>
              {accounts.map((acct) => {
                const isSelected = acct.id === selectedAccountId;
                return (
                  <Pressable
                    key={acct.id}
                    onPress={() => setSelectedAccountId(acct.id)}
                    style={[
                      styles.accountOption,
                      isSelected && styles.accountOptionSelected,
                    ]}
                  >
                    <View style={styles.accountOptionInfo}>
                      <Text style={styles.accountNumberText}>
                        {acct.accountNumber} ({acct.accountType})
                      </Text>
                      <Text style={styles.accountBalanceText}>
                        Balance: {acct.balance} {acct.currency}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected ? <View style={styles.radioInner} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Beneficiary Details</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Beneficiary Full Name *</Text>
            <TextInput
              value={beneficiaryName}
              onChangeText={setBeneficiaryName}
              placeholder="e.g. Jane Doe"
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Bank Name</Text>
            <TextInput
              value={bankName}
              onChangeText={setBankName}
              placeholder="e.g. Apex Bank International"
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Beneficiary Account Number *</Text>
            <TextInput
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="e.g. 1234567890"
              style={styles.input}
              keyboardType="number-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || isLoadingAccounts}
          style={[
            styles.submitButton,
            (isSubmitting || isLoadingAccounts) && styles.submitButtonDisabled,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Save Beneficiary</Text>
          )}
        </Pressable>
      </ScrollView>
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
    fontSize: 26,
    fontWeight: "800",
  },
  content: {
    gap: 20,
    padding: 20,
  },
  errorBox: {
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    color: "#991B1B",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    backgroundColor: "#FFFFFF",
    gap: 14,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 14,
  },
  helperText: {
    color: "#6B7280",
    fontSize: 14,
  },
  accountPicker: {
    gap: 10,
  },
  accountOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#F9FAFB",
  },
  accountOptionSelected: {
    borderColor: "#1D4ED8",
    backgroundColor: "#EFF6FF",
  },
  accountOptionInfo: {
    flex: 1,
    gap: 2,
  },
  accountNumberText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
  accountBalanceText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "500",
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: "#1D4ED8",
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#1D4ED8",
  },
  field: {
    gap: 6,
  },
  label: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 14,
    color: "#111827",
    fontSize: 15,
    backgroundColor: "#FFFFFF",
  },
  submitButton: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#1D4ED8",
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
