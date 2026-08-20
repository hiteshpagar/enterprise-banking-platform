import { useCallback, useEffect, useState } from "react";
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
import { fetchCustomerBeneficiaries } from "../../../services/beneficiaryService";
import { initiateTransfer } from "../../../services/fundTransferService";

import type { AccountSummary } from "../../../types/account";
import type { Beneficiary } from "../../../types/beneficiary";
import type { TransferResponse } from "../../../types/fundTransfer";

import { TransferStepIndicator } from "../../../components/fund-transfer/TransferStepIndicator";
import { AccountPicker } from "../../../components/fund-transfer/AccountPicker";
import { BeneficiaryPicker } from "../../../components/fund-transfer/BeneficiaryPicker";
import { TransferReview } from "../../../components/fund-transfer/TransferReview";
import { TransferResult } from "../../../components/fund-transfer/TransferResult";

export default function FundTransferScreen() {
  const [currentStep, setCurrentStep] = useState(1); // 1: Account, 2: Beneficiary, 3: Amount, 4: Review, 5: Result

  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);

  const [selectedAccount, setSelectedAccount] = useState<AccountSummary | null>(null);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);

  const [amountInput, setAmountInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [validationError, setValidationError] = useState("");
  const [apiError, setApiError] = useState("");

  const [transferResponse, setTransferResponse] = useState<TransferResponse | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);

  const loadInitialData = useCallback(async () => {
    setIsLoadingData(true);
    setApiError("");

    try {
      const [accResponse, benResponse] = await Promise.all([
        fetchAccounts({ page: 0, size: 50 }, true),
        fetchCustomerBeneficiaries(0, 50),
      ]);

      const activeAccounts = accResponse.content.filter(
        (a) => a.status === "ACTIVE"
      );
      setAccounts(activeAccounts);

      if (activeAccounts.length > 0) {
        setSelectedAccount(activeAccounts[0]);
      }

      const activeBeneficiaries = benResponse.content.filter(
        (b) => b.status === "ACTIVE"
      );
      setBeneficiaries(activeBeneficiaries);

      if (activeBeneficiaries.length > 0) {
        setSelectedBeneficiary(activeBeneficiaries[0]);
      }
    } catch (err) {
      setApiError(
        err instanceof Error
          ? err.message
          : "Failed to load accounts or beneficiaries."
      );
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  function handleAccountSelect(account: AccountSummary) {
    setSelectedAccount(account);
    setValidationError("");
  }

  function handleBeneficiarySelect(beneficiary: Beneficiary) {
    setSelectedBeneficiary(beneficiary);
    setValidationError("");
  }

  function handleNextFromAccount() {
    if (!selectedAccount) {
      setValidationError("Please select a source account.");
      return;
    }
    setValidationError("");
    setCurrentStep(2);
  }

  function handleNextFromBeneficiary() {
    if (!selectedBeneficiary) {
      setValidationError("Please select a beneficiary.");
      return;
    }

    if (
      selectedAccount &&
      (selectedAccount.id === selectedBeneficiary.accountId ||
        selectedAccount.accountNumber === selectedBeneficiary.accountNumber)
    ) {
      setValidationError(
        "Source and destination accounts must be different. Please select a beneficiary with a different account number."
      );
      return;
    }

    setValidationError("");
    setCurrentStep(3);
  }

  function handleNextFromAmount() {
    setValidationError("");

    const trimmed = amountInput.trim();
    if (!trimmed) {
      setValidationError("Please enter a transfer amount.");
      return;
    }

    const numericAmount = parseFloat(trimmed);
    if (isNaN(numericAmount)) {
      setValidationError("Please enter a valid numeric amount.");
      return;
    }

    if (numericAmount <= 0) {
      setValidationError("Amount must be greater than zero.");
      return;
    }

    if (selectedAccount && numericAmount > selectedAccount.balance) {
      setValidationError(
        `Insufficient balance. Available balance is ${selectedAccount.currency} ${selectedAccount.balance.toFixed(
          2
        )}`
      );
      return;
    }

    setCurrentStep(4);
  }

  async function handleConfirmTransfer() {
    if (!selectedAccount || !selectedBeneficiary) {
      return;
    }

    const numericAmount = parseFloat(amountInput.trim());
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }

    setIsSubmitting(true);
    setApiError("");

    try {
      const response = await initiateTransfer({
        sourceAccountId: selectedAccount.id,
        destinationAccountId: selectedBeneficiary.accountId,
        destinationAccountNumber: selectedBeneficiary.accountNumber,
        amount: numericAmount,
        description: descriptionInput.trim() || undefined,
      });

      setTransferResponse(response);
      setTransferSuccess(true);
      setCurrentStep(5);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Transfer failed due to a network or server error.";
      setApiError(msg);
      setTransferSuccess(false);
      setCurrentStep(5);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleResetForm() {
    setCurrentStep(1);
    setAmountInput("");
    setDescriptionInput("");
    setValidationError("");
    setApiError("");
    setTransferResponse(null);
    setTransferSuccess(false);
    loadInitialData();
  }

  if (isLoadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text style={styles.loadingText}>Loading accounts and beneficiaries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Fund Transfer</Text>
          <Text style={styles.title}>Send Money</Text>
        </View>
      </View>

      {/* STEP INDICATOR */}
      <TransferStepIndicator currentStep={currentStep} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {validationError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{validationError}</Text>
          </View>
        ) : null}

        {/* STEP 1: SELECT ACCOUNT */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <AccountPicker
              accounts={accounts}
              selectedAccountId={selectedAccount?.id}
              onSelect={handleAccountSelect}
            />

            <Pressable
              onPress={handleNextFromAccount}
              disabled={!selectedAccount}
              style={[
                styles.primaryButton,
                !selectedAccount && styles.disabledButton,
              ]}
            >
              <Text style={styles.primaryButtonText}>Next: Select Beneficiary</Text>
            </Pressable>
          </View>
        )}

        {/* STEP 2: SELECT BENEFICIARY */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <BeneficiaryPicker
              beneficiaries={beneficiaries}
              selectedBeneficiaryId={selectedBeneficiary?.id}
              onSelect={handleBeneficiarySelect}
            />

            <View style={styles.buttonRow}>
              <Pressable
                onPress={() => setCurrentStep(1)}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Back</Text>
              </Pressable>

              <Pressable
                onPress={handleNextFromBeneficiary}
                disabled={!selectedBeneficiary}
                style={[
                  styles.primaryButton,
                  !selectedBeneficiary && styles.disabledButton,
                  { flex: 2 },
                ]}
              >
                <Text style={styles.primaryButtonText}>Next: Enter Amount</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* STEP 3: ENTER AMOUNT & DESCRIPTION */}
        {currentStep === 3 && selectedAccount && selectedBeneficiary && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionHeader}>Enter Transfer Amount</Text>

            {/* SELECTION SUMMARY CARD */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>From</Text>
                <Text style={styles.summaryValue}>
                  {selectedAccount.accountNumber} ({selectedAccount.currency}{" "}
                  {selectedAccount.balance.toFixed(2)})
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>To</Text>
                <Text style={styles.summaryValue}>
                  {selectedBeneficiary.beneficiaryName} (
                  {selectedBeneficiary.accountNumber})
                </Text>
              </View>
            </View>

            {/* AMOUNT INPUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Amount ({selectedAccount.currency})
              </Text>
              <TextInput
                value={amountInput}
                onChangeText={(val) => {
                  setAmountInput(val);
                  setValidationError("");
                }}
                placeholder="0.00"
                keyboardType="decimal-pad"
                style={styles.amountInput}
              />
            </View>

            {/* DESCRIPTION INPUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description / Memo (Optional)</Text>
              <TextInput
                value={descriptionInput}
                onChangeText={setDescriptionInput}
                placeholder="e.g. Rent payment, Dinner split"
                maxLength={255}
                style={styles.textInput}
              />
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                onPress={() => setCurrentStep(2)}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Back</Text>
              </Pressable>

              <Pressable
                onPress={handleNextFromAmount}
                style={[styles.primaryButton, { flex: 2 }]}
              >
                <Text style={styles.primaryButtonText}>Next: Review Transfer</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* STEP 4: REVIEW & CONFIRM */}
        {currentStep === 4 && selectedAccount && selectedBeneficiary && (
          <TransferReview
            sourceAccount={selectedAccount}
            beneficiary={selectedBeneficiary}
            amount={parseFloat(amountInput) || 0}
            description={descriptionInput.trim()}
            isSubmitting={isSubmitting}
            onCancel={() => setCurrentStep(3)}
            onConfirm={handleConfirmTransfer}
          />
        )}

        {/* STEP 5: RESULT (SUCCESS / FAILURE) */}
        {currentStep === 5 && (
          <TransferResult
            success={transferSuccess}
            transferResponse={transferResponse}
            errorMessage={apiError}
            sourceAccount={selectedAccount}
            beneficiary={selectedBeneficiary}
            amount={parseFloat(amountInput) || 0}
            onGoToDashboard={() => router.replace("/(customer)/dashboard")}
            onViewHistory={() => router.replace("/(customer)/transactions")}
            onNewTransfer={handleResetForm}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7FA",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 18,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
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
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    marginTop: 2,
    color: "#111827",
    fontSize: 28,
    fontWeight: "800",
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  stepContainer: {
    gap: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    padding: 14,
    borderRadius: 10,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 14,
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  amountInput: {
    height: 54,
    borderWidth: 2,
    borderColor: "#1D4ED8",
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#EEF2F7",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  secondaryButtonText: {
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
