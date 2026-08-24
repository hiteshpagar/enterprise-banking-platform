import React, { useEffect, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { fetchAccounts } from "@/services/accountService";
import { executeFundTransfer } from "@/services/fundTransferService";
import type { AccountSummary } from "@/types/account";
import { Colors } from "@/constants/theme";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { StepIndicator } from "@/components/common/StepIndicator";
import { BottomNavBar } from "@/components/common/BottomNavBar";

export default function BankFundTransferScreen() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [selectedSourceAccount, setSelectedSourceAccount] = useState<AccountSummary | null>(null);
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [transferType, setTransferType] = useState<"IMPS" | "NEFT" | "RTGS">("IMPS");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");

  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [txResult, setTxResult] = useState<any>(null);

  useEffect(() => {
    async function loadAccountsList() {
      setIsLoadingAccounts(true);
      try {
        const res = await fetchAccounts({ page: 0, size: 50 }, false);
        const list = res.content || [];
        setAccounts(list);
        if (list.length > 0) {
          setSelectedSourceAccount(list[0]);
        }
      } catch (err) {
        console.error("Bank accounts load error", err);
      } finally {
        setIsLoadingAccounts(false);
      }
    }
    loadAccountsList();
  }, []);

  const steps = [
    { number: 1, label: "Details" },
    { number: 2, label: "Review" },
    { number: 3, label: "Confirm" },
  ];

  async function handleConfirm() {
    if (!selectedSourceAccount || !toAccountNumber || !amount) {
      setError("Please fill out all fields.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const res = await executeFundTransfer({
        sourceAccountId: selectedSourceAccount.id,
        targetAccountId: toAccountNumber,
        amount: parseFloat(amount),
        transferType,
        remarks,
      });
      setTxResult(res);
      setStep(3);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Transfer failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={step === 3 ? "Transfer Success" : "Funds Transfer"}
        showBack={step < 3}
        onBack={() => {
          if (step === 2) setStep(1);
          else router.back();
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainWrapper}>
          <StepIndicator steps={steps} currentStep={step} />

          {/* STEP 1: Details Form */}
          {step === 1 && (
            <View style={styles.formCard}>
              <Text style={styles.label}>From Account</Text>
              {isLoadingAccounts ? (
                <ActivityIndicator color={Colors.actionBlue} style={{ marginVertical: 14 }} />
              ) : accounts.length === 0 ? (
                <View style={styles.emptyNotice}>
                  <Text style={styles.emptyNoticeText}>No source accounts found.</Text>
                </View>
              ) : (
                <View style={styles.accSelectList}>
                  {accounts.slice(0, 3).map((acc) => {
                    const isSelected = selectedSourceAccount?.id === acc.id;
                    return (
                      <Pressable
                        key={acc.id}
                        style={[styles.accOptionCard, isSelected && styles.accOptionSelected]}
                        onPress={() => setSelectedSourceAccount(acc)}
                      >
                        <View style={styles.radioDot}>
                          {isSelected && <View style={styles.radioDotInner} />}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.accOptionNum}>{acc.accountNumber}</Text>
                          <Text style={styles.accOptionSub}>
                            {acc.customerName ? `${acc.customerName} • ` : ""}{acc.accountType}
                          </Text>
                        </View>
                        <Text style={styles.accOptionBal}>₹{(acc.balance || 0).toLocaleString("en-IN")}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <View style={styles.field}>
                <Text style={styles.label}>To Account Number</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    value={toAccountNumber}
                    onChangeText={setToAccountNumber}
                    placeholder="Enter target account number"
                    keyboardType="number-pad"
                    style={styles.input}
                  />
                  <Ionicons name="search" size={18} color={Colors.textSecondary} />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Transfer Type</Text>
                <View style={styles.typeSegmentRow}>
                  {(["IMPS", "NEFT", "RTGS"] as const).map((t) => (
                    <Pressable
                      key={t}
                      style={[styles.typeBtn, transferType === t && styles.typeBtnActive]}
                      onPress={() => setTransferType(t)}
                    >
                      <Text style={[styles.typeText, transferType === t && styles.typeTextActive]}>
                        {t}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Amount</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="Enter amount"
                    keyboardType="number-pad"
                    style={styles.inputBold}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Remarks (Optional)</Text>
                <TextInput
                  value={remarks}
                  onChangeText={setRemarks}
                  placeholder="Enter remarks"
                  style={styles.inputPlain}
                />
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Pressable
                style={styles.primaryBtn}
                onPress={() => {
                  if (!toAccountNumber || !amount) {
                    setError("Please enter target account number and amount");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
              >
                <Text style={styles.primaryBtnText}>Continue</Text>
              </Pressable>
            </View>
          )}

          {/* STEP 2: Review */}
          {step === 2 && (
            <View style={styles.formCard}>
              <Text style={styles.reviewTitle}>Transfer Summary</Text>

              <View style={styles.reviewBox}>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>From Account</Text>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.reviewValBold}>{selectedSourceAccount?.accountNumber}</Text>
                    <Text style={styles.reviewValSub}>
                      {selectedSourceAccount?.customerName || ""} ({selectedSourceAccount?.accountType})
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>To Account</Text>
                  <Text style={styles.reviewValBold}>{toAccountNumber}</Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Amount</Text>
                  <Text style={styles.reviewAmount}>₹{parseFloat(amount || "0").toLocaleString("en-IN")}.00</Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Transfer Type</Text>
                  <Text style={styles.reviewValBold}>{transferType}</Text>
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

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Pressable style={styles.primaryBtn} onPress={handleConfirm} disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Confirm Transfer</Text>
                )}
              </Pressable>

              <Pressable style={styles.secondaryBtn} onPress={() => setStep(1)}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </Pressable>
            </View>
          )}

          {/* STEP 3: Confirm Success */}
          {step === 3 && (
            <View style={styles.resultContainer}>
              <View style={styles.successIconBadge}>
                <Ionicons name="checkmark" size={44} color="#FFFFFF" />
              </View>

              <Text style={styles.resultTitle}>Transfer Successful!</Text>
              <Text style={styles.resultAmount}>₹{parseFloat(amount || "0").toLocaleString("en-IN")}.00</Text>
              <Text style={styles.resultSubText}>
                has been transferred to account{"\n"}
                <Text style={{ fontWeight: "700", color: Colors.textPrimary }}>{toAccountNumber}</Text>
              </Text>

              <View style={styles.receiptCard}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Transaction Reference</Text>
                  <Text style={styles.receiptVal}>{txResult?.reference || txResult?.id || "TXN" + Date.now()}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Date & Time</Text>
                  <Text style={styles.receiptVal}>{new Date().toLocaleDateString("en-IN")}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Transfer Type</Text>
                  <Text style={styles.receiptVal}>{transferType}</Text>
                </View>
              </View>

              <Pressable style={styles.primaryBtn} onPress={() => router.push("/(bank)/dashboard")}>
                <Text style={styles.primaryBtnText}>Back to Dashboard</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNavBar type="bank" />
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
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  accSelectList: {
    gap: 8,
  },
  accOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  accOptionSelected: {
    borderColor: Colors.actionBlue,
    backgroundColor: Colors.lightBlue,
  },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.actionBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.actionBlue,
  },
  accOptionNum: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  accOptionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  accOptionBal: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.actionBlue,
  },
  emptyNotice: {
    padding: 16,
    backgroundColor: Colors.lightBlue,
    borderRadius: 12,
  },
  emptyNoticeText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  inputBold: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  inputPlain: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: "#FFFFFF",
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.actionBlue,
    marginRight: 8,
  },
  typeSegmentRow: {
    flexDirection: "row",
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: Colors.lightBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  typeBtnActive: {
    backgroundColor: Colors.actionBlue,
  },
  typeText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.actionBlue,
  },
  typeTextActive: {
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
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.actionBlue,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    width: "100%",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.actionBlue,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  secondaryBtnText: {
    color: Colors.actionBlue,
    fontSize: 16,
    fontWeight: "700",
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  reviewBox: {
    backgroundColor: Colors.lightBlue,
    borderRadius: 14,
    padding: 16,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
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
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  reviewAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.actionBlue,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
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
  resultTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  resultAmount: {
    fontSize: 30,
    fontWeight: "900",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  resultSubText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
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
    paddingVertical: 8,
  },
  receiptLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  receiptVal: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
});
