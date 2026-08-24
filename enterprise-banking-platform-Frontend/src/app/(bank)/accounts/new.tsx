import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { openAccount } from "@/services/accountService";
import { fetchCustomers } from "@/services/customerService";
import type { CustomerSummary } from "@/types/customer";
import { Colors } from "@/constants/theme";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { StepIndicator } from "@/components/common/StepIndicator";

export default function CreateAccountScreen() {
  const [step, setStep] = useState(1);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [accountType, setAccountType] = useState<"SAVINGS" | "CURRENT">("SAVINGS");
  const [initialDeposit, setInitialDeposit] = useState("");
  const [currency] = useState("INR");

  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCustomersList() {
      setIsLoadingCustomers(true);
      try {
        const res = await fetchCustomers({ page: 0, size: 50 });
        const list = res.content || [];
        setCustomers(list);
        if (list.length > 0) {
          setSelectedCustomer(list[0]);
        }
      } catch (err) {
        console.error("Customers list load error", err);
      } finally {
        setIsLoadingCustomers(false);
      }
    }
    loadCustomersList();
  }, []);

  async function handleCreateAccount() {
    if (!selectedCustomer) {
      setError("Please select a customer.");
      return;
    }

    setError("");
    try {
      setIsSubmitting(true);
      await openAccount({
        customerId: selectedCustomer.id,
        accountType,
        currency,
        openingBalance: parseFloat(initialDeposit || "0"),
      });
      router.back();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to create account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const steps = [
    { number: 1, label: "Customer" },
    { number: 2, label: "Account Details" },
    { number: 3, label: "Review" },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader title="Create New Account" showBack={true} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.mainWrapper}>
            <StepIndicator steps={steps} currentStep={step} />

            <View style={styles.formCard}>
              {step === 1 && (
                <>
                  <Text style={styles.label}>Select Customer</Text>
                  {isLoadingCustomers ? (
                    <ActivityIndicator color={Colors.actionBlue} style={{ marginVertical: 20 }} />
                  ) : customers.length === 0 ? (
                    <View style={styles.emptyNotice}>
                      <Text style={styles.emptyNoticeText}>No customers available. Please create a customer record first.</Text>
                    </View>
                  ) : (
                    <View style={styles.customerSelectList}>
                      {customers.map((c) => {
                        const isSelected = selectedCustomer?.id === c.id;
                        const name = `${c.firstName} ${c.lastName}`;
                        return (
                          <Pressable
                            key={c.id}
                            style={[styles.customerOptionCard, isSelected && styles.customerOptionSelected]}
                            onPress={() => setSelectedCustomer(c)}
                          >
                            <View style={styles.radioDot}>
                              {isSelected && <View style={styles.radioDotInner} />}
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.customerOptionName}>{name}</Text>
                              <Text style={styles.customerOptionSub}>{c.customerNumber} • {c.email || c.mobileNumber || ""}</Text>
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}

                  <Pressable
                    style={[styles.nextBtn, !selectedCustomer && styles.btnDisabled]}
                    onPress={() => {
                      if (selectedCustomer) setStep(2);
                    }}
                    disabled={!selectedCustomer}
                  >
                    <Text style={styles.nextBtnText}>Next</Text>
                  </Pressable>
                </>
              )}

              {step === 2 && (
                <>
                  <View style={styles.field}>
                    <Text style={styles.label}>Account Type</Text>
                    <View style={styles.radioRow}>
                      <Pressable
                        style={[styles.radioBtn, accountType === "SAVINGS" && styles.radioActive]}
                        onPress={() => setAccountType("SAVINGS")}
                      >
                        <Text style={[styles.radioText, accountType === "SAVINGS" && styles.radioTextActive]}>
                          Savings Account
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[styles.radioBtn, accountType === "CURRENT" && styles.radioActive]}
                        onPress={() => setAccountType("CURRENT")}
                      >
                        <Text style={[styles.radioText, accountType === "CURRENT" && styles.radioTextActive]}>
                          Current Account
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Initial Deposit Amount</Text>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.currencySymbol}>₹</Text>
                      <TextInput
                        value={initialDeposit}
                        onChangeText={setInitialDeposit}
                        placeholder="Enter initial balance"
                        keyboardType="number-pad"
                        style={styles.input}
                      />
                    </View>
                  </View>

                  <View style={styles.buttonRow}>
                    <Pressable style={styles.backBtn} onPress={() => setStep(1)}>
                      <Text style={styles.backBtnText}>Back</Text>
                    </Pressable>
                    <Pressable style={[styles.nextBtn, { flex: 1 }]} onPress={() => setStep(3)}>
                      <Text style={styles.nextBtnText}>Next</Text>
                    </Pressable>
                  </View>
                </>
              )}

              {step === 3 && (
                <>
                  <Text style={styles.reviewHeading}>Review Account Opening</Text>

                  <View style={styles.reviewBox}>
                    <View style={styles.reviewRow}>
                      <Text style={styles.reviewLabel}>Customer</Text>
                      <Text style={styles.reviewVal}>
                        {selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName} (${selectedCustomer.customerNumber})` : ""}
                      </Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.reviewRow}>
                      <Text style={styles.reviewLabel}>Account Type</Text>
                      <Text style={styles.reviewVal}>{accountType === "SAVINGS" ? "Savings Account" : "Current Account"}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.reviewRow}>
                      <Text style={styles.reviewLabel}>Initial Deposit</Text>
                      <Text style={styles.reviewValBold}>₹{parseFloat(initialDeposit || "0").toLocaleString("en-IN")}.00</Text>
                    </View>
                  </View>

                  {error ? (
                    <View style={styles.errorBox}>
                      <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  <View style={styles.buttonRow}>
                    <Pressable style={styles.backBtn} onPress={() => setStep(2)}>
                      <Text style={styles.backBtnText}>Back</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.nextBtn, { flex: 1 }]}
                      onPress={handleCreateAccount}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.nextBtnText}>Submit & Open Account</Text>
                      )}
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  customerSelectList: {
    gap: 8,
  },
  customerOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  customerOptionSelected: {
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
  customerOptionName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  customerOptionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
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
  radioRow: {
    flexDirection: "row",
    gap: 10,
  },
  radioBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  radioActive: {
    backgroundColor: Colors.actionBlue,
    borderColor: Colors.actionBlue,
  },
  radioText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  radioTextActive: {
    color: "#FFFFFF",
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
  currencySymbol: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.actionBlue,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  nextBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.actionBlue,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  backBtn: {
    width: 90,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.lightBlue,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primary,
  },
  reviewHeading: {
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
    paddingVertical: 10,
  },
  reviewLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  reviewVal: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  reviewValBold: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.actionBlue,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
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
});