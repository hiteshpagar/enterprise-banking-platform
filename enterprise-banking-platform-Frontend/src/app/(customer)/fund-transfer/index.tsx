import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { executeFundTransfer } from "@/services/fundTransferService";
import { fetchAccounts } from "@/services/accountService";
import { fetchBeneficiaries } from "@/services/beneficiaryService";
import type { AccountSummary } from "@/types/account";
import type { Beneficiary } from "@/types/beneficiary";
import { Colors } from "@/constants/theme";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { BottomNavBar } from "@/components/common/BottomNavBar";

export default function CustomerFundTransferScreen() {
  const [step, setStep] = useState<"FORM" | "REVIEW" | "SUCCESS" | "FAILED">("FORM");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [selectedQuickAmount, setSelectedQuickAmount] = useState("");

  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountSummary | null>(null);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [txResult, setTxResult] = useState<any>(null);

  useEffect(() => {
    async function loadFormOptions() {
      setIsLoading(true);
      try {
        const [accRes, benRes] = await Promise.allSettled([
          fetchAccounts({ page: 0, size: 20 }),
          fetchBeneficiaries(0, 50, "ACTIVE"),
        ]);

        if (accRes.status === "fulfilled" && accRes.value.content?.length) {
          setAccounts(accRes.value.content);
          setSelectedAccount(accRes.value.content[0]);
        }
        if (benRes.status === "fulfilled" && benRes.value?.length) {
          const activeBeneficiaries = benRes.value.filter(
            (b) => b.status === "ACTIVE"
          );
          setBeneficiaries(activeBeneficiaries);
          setSelectedBeneficiary(
            activeBeneficiaries.length > 0 ? activeBeneficiaries[0] : null
          );
        } else {
          setBeneficiaries([]);
          setSelectedBeneficiary(null);
        }
      } catch (err) {
        console.error("Fund transfer data load error", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFormOptions();
  }, []);

  function handleQuickAmountSelect(val: string) {
    setSelectedQuickAmount(val);
    if (val !== "Other") {
      setAmount(val);
    }
  }

  async function handleConfirmTransfer() {
    if (!selectedAccount || !selectedBeneficiary || !amount) {
      setError("Please fill out all transfer fields");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const transferAmount = parseFloat(amount);
      if (transferAmount > selectedAccount.balance) {
        setStep("FAILED");
      } else {
        const res = await executeFundTransfer({
          sourceAccountId: selectedAccount.id,
          targetAccountId: selectedBeneficiary.accountId || selectedBeneficiary.id,
          amount: transferAmount,
          transferType: "IMPS",
          remarks,
        });
        setTxResult(res);
        setStep("SUCCESS");
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      setStep("FAILED");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={
          step === "FORM"
            ? "Fund Transfer"
            : step === "REVIEW"
            ? "Review Transfer"
            : step === "SUCCESS"
            ? "Transfer Success"
            : "Transfer Failed"
        }
        showBack={step === "FORM" || step === "REVIEW"}
        onBack={() => {
          if (step === "REVIEW") setStep("FORM");
          else router.back();
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainWrapper}>
          {/* STEP 1: FORM */}
          {step === "FORM" && (
            <View style={styles.stepContainer}>
              {isLoading ? (
                <ActivityIndicator color={Colors.actionBlue} size="large" style={{ marginVertical: 30 }} />
              ) : (
                <>
                  <Text style={styles.fieldLabel}>From Account</Text>
                  {selectedAccount ? (
                    <Pressable
                      style={({ pressed }) => [styles.accountCard, pressed && styles.cardPressed]}
                      onPress={() => accounts.length > 1 && setShowAccountModal(true)}
                    >
                      <View style={styles.cardIconCircle}>
                        <Ionicons name="business" size={20} color={Colors.actionBlue} />
                      </View>
                      <View style={styles.cardDetails}>
                        <Text style={styles.cardTitle}>
                          {selectedAccount.accountType === "SAVINGS" ? "Savings Account" : "Current Account"}
                        </Text>
                        <Text style={styles.cardSubText}>•••• •••• {selectedAccount.accountNumber.slice(-4)}</Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.cardBalance}>₹{(selectedAccount.balance || 0).toLocaleString("en-IN")}.00</Text>
                        {accounts.length > 1 && (
                          <View style={styles.switchBadge}>
                            <Text style={styles.switchText}>Switch</Text>
                            <Ionicons name="chevron-down" size={12} color={Colors.actionBlue} />
                          </View>
                        )}
                      </View>
                    </Pressable>
                  ) : (
                    <View style={styles.emptyNotice}>
                      <Text style={styles.emptyNoticeText}>No accounts available</Text>
                    </View>
                  )}

                  <Text style={styles.fieldLabel}>To Beneficiary</Text>
                  {selectedBeneficiary ? (
                    <Pressable
                      style={({ pressed }) => [styles.accountCard, pressed && styles.cardPressed]}
                      onPress={() => beneficiaries.length > 1 && setShowBeneficiaryModal(true)}
                    >
                      <View style={[styles.cardIconCircle, { backgroundColor: "#FEF3C7" }]}>
                        <Ionicons name="person" size={20} color="#D97706" />
                      </View>
                      <View style={styles.cardDetails}>
                        <Text style={styles.cardTitle}>{selectedBeneficiary.beneficiaryName}</Text>
                        <Text style={styles.cardSubText}>
                          {selectedBeneficiary.bankName ? `${selectedBeneficiary.bankName} ` : ""}•••• {selectedBeneficiary.accountNumber.slice(-4)}
                        </Text>
                      </View>
                      {beneficiaries.length > 1 ? (
                        <View style={styles.switchBadge}>
                          <Text style={styles.switchText}>Switch ({beneficiaries.length})</Text>
                          <Ionicons name="chevron-down" size={12} color={Colors.actionBlue} />
                        </View>
                      ) : null}
                    </Pressable>
                  ) : (
                    <View style={styles.emptyNotice}>
                      <Text style={styles.emptyNoticeText}>No active beneficiaries available for transfer</Text>
                    </View>
                  )}

                  <Text style={styles.fieldLabel}>Amount</Text>
                  <View style={styles.amountInputWrapper}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="Enter amount"
                      keyboardType="number-pad"
                      style={styles.amountInput}
                    />
                  </View>

                  {/* Quick Amount Chips */}
                  <View style={styles.chipRow}>
                    {["1000", "2000", "5000", "Other"].map((val) => {
                      const isSelected = selectedQuickAmount === val;
                      return (
                        <Pressable
                          key={val}
                          style={[styles.chip, isSelected && styles.chipActive]}
                          onPress={() => handleQuickAmountSelect(val)}
                        >
                          <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                            {val === "Other" ? "Other" : `₹${parseInt(val).toLocaleString("en-IN")}`}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {error ? (
                    <View style={styles.errorBox}>
                      <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  <Pressable
                    style={({ pressed }) => [styles.primaryButton, pressed && styles.btnPressed]}
                    onPress={() => {
                      if (!amount || parseFloat(amount) <= 0) {
                        setError("Please enter a valid amount");
                        return;
                      }
                      setStep("REVIEW");
                    }}
                  >
                    <Text style={styles.primaryButtonText}>Continue</Text>
                  </Pressable>
                </>
              )}
            </View>
          )}

          {/* STEP 2: REVIEW */}
          {step === "REVIEW" && (
            <View style={styles.stepContainer}>
              <View style={styles.reviewCard}>
                <Text style={styles.reviewCardTitle}>Transfer Details</Text>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>From</Text>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.reviewValBold}>
                      {selectedAccount?.accountType === "SAVINGS" ? "Savings Account" : "Current Account"}
                    </Text>
                    <Text style={styles.reviewValSub}>•••• •••• {selectedAccount?.accountNumber.slice(-4)}</Text>
                  </View>
                </View>
                <View style={styles.divider} />

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>To</Text>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.reviewValBold}>{selectedBeneficiary?.beneficiaryName}</Text>
                    <Text style={styles.reviewValSub}>
                      {selectedBeneficiary?.bankName ? `${selectedBeneficiary.bankName} ` : ""}•••• {selectedBeneficiary?.accountNumber.slice(-4)}
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Amount</Text>
                  <Text style={styles.reviewAmount}>₹{parseFloat(amount || "0").toLocaleString("en-IN")}.00</Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Transfer Type</Text>
                  <Text style={styles.reviewValBold}>IMPS</Text>
                </View>

                {remarks ? (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.reviewRow}>
                      <Text style={styles.reviewLabel}>Remarks</Text>
                      <Text style={styles.reviewValBold}>{remarks}</Text>
                    </View>
                  </>
                ) : null}
              </View>

              {/* Warning Alert Box */}
              <View style={styles.warningBox}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#D97706" />
                <Text style={styles.warningText}>
                  Please review the details carefully before confirming.
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [styles.primaryButton, pressed && styles.btnPressed]}
                onPress={handleConfirmTransfer}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Confirm Transfer</Text>
                )}
              </Pressable>
            </View>
          )}

          {/* STEP 3: SUCCESS */}
          {step === "SUCCESS" && (
            <View style={styles.resultContainer}>
              <View style={styles.successIconBadge}>
                <Ionicons name="checkmark" size={44} color="#FFFFFF" />
              </View>

              <Text style={styles.resultTitle}>Transfer Successful!</Text>
              <Text style={styles.resultAmount}>₹{parseFloat(amount || "0").toLocaleString("en-IN")}.00</Text>
              <Text style={styles.resultSubText}>
                has been transferred to{"\n"}
                <Text style={{ fontWeight: "700", color: Colors.textPrimary }}>{selectedBeneficiary?.beneficiaryName}</Text>{"\n"}
                {selectedBeneficiary?.bankName ? `${selectedBeneficiary.bankName} ` : ""}•••• {selectedBeneficiary?.accountNumber.slice(-4)}
              </Text>

              <View style={styles.receiptCard}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Transaction Reference</Text>
                  <Text style={styles.receiptVal} numberOfLines={1} ellipsizeMode="middle">
                    {txResult?.reference || txResult?.id || txResult?.transferReference || "TXN" + Date.now()}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Date & Time</Text>
                  <Text style={styles.receiptVal}>{new Date().toLocaleDateString("en-IN")}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Transfer Type</Text>
                  <Text style={styles.receiptVal}>IMPS</Text>
                </View>
              </View>

              <Pressable style={styles.primaryButton} onPress={() => router.push("/(customer)/dashboard")}>
                <Text style={styles.primaryButtonText}>Back to Home</Text>
              </Pressable>
            </View>
          )}

          {/* STEP 4: FAILED */}
          {step === "FAILED" && (
            <View style={styles.resultContainer}>
              <View style={styles.failedIconBadge}>
                <Ionicons name="alert" size={44} color="#FFFFFF" />
              </View>

              <Text style={styles.resultTitle}>Transfer Failed!</Text>
              <Text style={styles.failedSubTitle}>Insufficient Balance</Text>
              <Text style={styles.resultSubText}>
                You do not have enough balance to complete this transfer.
              </Text>

              <View style={styles.balanceSummaryCard}>
                <Text style={styles.balanceSummaryLabel}>Available Balance</Text>
                <Text style={styles.balanceSummaryVal}>₹{(selectedAccount?.balance || 0).toLocaleString("en-IN")}.00</Text>
              </View>

              <Pressable style={styles.primaryButton} onPress={() => setStep("FORM")}>
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </Pressable>

              <Pressable style={styles.secondaryButton} onPress={() => router.push("/(customer)/dashboard")}>
                <Text style={styles.secondaryButtonText}>Back to Home</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Account Picker Modal */}
      <Modal visible={showAccountModal} transparent animationType="slide" onRequestClose={() => setShowAccountModal(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowAccountModal(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Source Account</Text>
              <Pressable onPress={() => setShowAccountModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 350 }}>
              {accounts.map((acc) => {
                const isSelected = selectedAccount?.id === acc.id;
                return (
                  <Pressable
                    key={acc.id}
                    style={[styles.modalOptionCard, isSelected && styles.modalOptionActive]}
                    onPress={() => {
                      setSelectedAccount(acc);
                      setShowAccountModal(false);
                    }}
                  >
                    <Ionicons name="business" size={20} color={isSelected ? Colors.actionBlue : Colors.textSecondary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalOptionTitle}>{acc.accountType === "SAVINGS" ? "Savings Account" : "Current Account"}</Text>
                      <Text style={styles.modalOptionSub}>•••• {acc.accountNumber.slice(-4)}</Text>
                    </View>
                    <Text style={styles.modalOptionVal}>₹{(acc.balance || 0).toLocaleString("en-IN")}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Beneficiary Picker Modal */}
      <Modal visible={showBeneficiaryModal} transparent animationType="slide" onRequestClose={() => setShowBeneficiaryModal(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowBeneficiaryModal(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Beneficiary</Text>
              <Pressable onPress={() => setShowBeneficiaryModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 350 }}>
              {beneficiaries.map((ben) => {
                const isSelected = selectedBeneficiary?.id === ben.id;
                return (
                  <Pressable
                    key={ben.id}
                    style={[styles.modalOptionCard, isSelected && styles.modalOptionActive]}
                    onPress={() => {
                      setSelectedBeneficiary(ben);
                      setShowBeneficiaryModal(false);
                    }}
                  >
                    <Ionicons name="person" size={20} color={isSelected ? "#D97706" : Colors.textSecondary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalOptionTitle}>{ben.beneficiaryName}</Text>
                      <Text style={styles.modalOptionSub}>{ben.bankName ? `${ben.bankName} • ` : ""}•••• {ben.accountNumber.slice(-4)}</Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={20} color={Colors.actionBlue} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <BottomNavBar type="customer" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  mainWrapper: {
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  stepContainer: {
    gap: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginTop: 4,
  },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardPressed: {
    opacity: 0.85,
    backgroundColor: "#F0F4FF",
  },
  cardIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  cardSubText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardBalance: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.actionBlue,
  },
  switchBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 4,
    backgroundColor: Colors.lightBlue,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  switchText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.actionBlue,
  },
  emptyNotice: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyNoticeText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  amountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.actionBlue,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 4,
  },
  chip: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: Colors.actionBlue,
    borderColor: Colors.actionBlue,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: 13,
    color: Colors.danger,
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.actionBlue,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    width: "100%",
  },
  btnPressed: {
    opacity: 0.9,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.actionBlue,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    width: "100%",
  },
  secondaryButtonText: {
    color: Colors.actionBlue,
    fontSize: 16,
    fontWeight: "700",
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  reviewLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  reviewValBold: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  reviewValSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  reviewAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.actionBlue,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  warningText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
    flex: 1,
  },
  resultContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  successIconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.actionBlue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  failedIconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.actionBlue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  failedSubTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.danger,
    marginBottom: 8,
  },
  resultAmount: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  resultSubText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  receiptCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  receiptLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  receiptVal: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
    textAlign: "right",
  },
  balanceSummaryCard: {
    width: "100%",
    backgroundColor: Colors.lightBlue,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  balanceSummaryLabel: {
    fontSize: 13,
    color: Colors.primaryBlue,
    fontWeight: "600",
  },
  balanceSummaryVal: {
    fontSize: 26,
    fontWeight: "900",
    color: Colors.primary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  modalOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  modalOptionActive: {
    borderColor: Colors.actionBlue,
    backgroundColor: Colors.lightBlue,
  },
  modalOptionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  modalOptionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalOptionVal: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.actionBlue,
  },
});
