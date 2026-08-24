import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
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
import { addBeneficiary } from "@/services/beneficiaryService";
import { Colors } from "@/constants/theme";
import { ScreenHeader } from "@/components/common/ScreenHeader";

const INDIAN_BANKS = [
  "HDFC Bank",
  "State Bank of India (SBI)",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank (PNB)",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "IndusInd Bank",
  "IDFC FIRST Bank",
  "Yes Bank",
  "Central Bank of India",
  "Indian Bank",
  "UCO Bank",
  "Bank of India",
  "Federal Bank",
  "Other Bank (Enter custom name)",
];

export default function AddBeneficiaryScreen() {
  const [name, setName] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [customBankName, setCustomBankName] = useState("");
  const [isCustomBank, setIsCustomBank] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankSearch, setBankSearch] = useState("");

  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectiveBankName = isCustomBank ? customBankName.trim() : selectedBank;

  function handleSelectBank(bank: string) {
    if (bank === "Other Bank (Enter custom name)") {
      setIsCustomBank(true);
      setSelectedBank("Other Bank");
    } else {
      setIsCustomBank(false);
      setSelectedBank(bank);
    }
    setShowBankModal(false);
  }

  async function handleAdd() {
    setError("");

    if (!name.trim()) {
      setError("Beneficiary name is required.");
      return;
    }
    if (isCustomBank && !customBankName.trim()) {
      setError("Please enter your bank name.");
      return;
    }
    if (!accountNumber.trim()) {
      setError("Account number is required.");
      return;
    }
    if (accountNumber !== confirmAccountNumber) {
      setError("Account numbers do not match.");
      return;
    }
    if (!ifscCode.trim()) {
      setError("IFSC Code is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await addBeneficiary({
        name: name.trim(),
        bankName: effectiveBankName,
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
      });
      router.back();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to add beneficiary.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredBanks = INDIAN_BANKS.filter((b) =>
    b.toLowerCase().includes(bankSearch.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Add Beneficiary" showBack={true} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.mainWrapper}>
            <View style={styles.formCard}>
              <View style={styles.field}>
                <Text style={styles.label}>Beneficiary Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter name"
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Bank Name</Text>
                <Pressable
                  style={({ pressed }) => [styles.pickerBox, pressed && styles.pickerPressed]}
                  onPress={() => setShowBankModal(true)}
                >
                  <Text style={styles.pickerText}>{selectedBank}</Text>
                  <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
                </Pressable>
              </View>

              {isCustomBank && (
                <View style={styles.field}>
                  <Text style={styles.label}>Custom Bank Name</Text>
                  <TextInput
                    value={customBankName}
                    onChangeText={setCustomBankName}
                    placeholder="Enter your bank name"
                    style={styles.input}
                  />
                </View>
              )}

              <View style={styles.field}>
                <Text style={styles.label}>Account Number</Text>
                <TextInput
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder="Enter account number"
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Confirm Account Number</Text>
                <TextInput
                  value={confirmAccountNumber}
                  onChangeText={setConfirmAccountNumber}
                  placeholder="Re-enter account number"
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>IFSC Code</Text>
                <TextInput
                  value={ifscCode}
                  onChangeText={setIfscCode}
                  placeholder="Enter IFSC code (e.g. HDFC0001234)"
                  autoCapitalize="characters"
                  style={styles.input}
                />
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Pressable
                onPress={handleAdd}
                disabled={isSubmitting}
                style={({ pressed }) => [styles.submitBtn, pressed && styles.btnPressed]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Add Beneficiary</Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Indian Banks Selection Modal */}
      <Modal
        visible={showBankModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBankModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowBankModal(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Bank</Text>
              <Pressable onPress={() => setShowBankModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>

            {/* Bank Search Input */}
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                value={bankSearch}
                onChangeText={setBankSearch}
                placeholder="Search bank name..."
                style={styles.searchInput}
              />
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {filteredBanks.map((bankNameOption, idx) => {
                const isSelected = selectedBank === bankNameOption || (isCustomBank && bankNameOption.startsWith("Other"));
                const isOther = bankNameOption.startsWith("Other");
                return (
                  <Pressable
                    key={idx}
                    style={[styles.bankOptionCard, isSelected && styles.bankOptionActive]}
                    onPress={() => handleSelectBank(bankNameOption)}
                  >
                    <Ionicons
                      name={isOther ? "create-outline" : "business-outline"}
                      size={20}
                      color={isSelected ? Colors.actionBlue : Colors.textSecondary}
                    />
                    <Text style={[styles.bankOptionText, isSelected && styles.bankOptionTextActive]}>
                      {bankNameOption}
                    </Text>
                    {isSelected && <Ionicons name="checkmark-circle" size={20} color={Colors.actionBlue} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: "#FFFFFF",
  },
  pickerBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },
  pickerPressed: {
    backgroundColor: Colors.lightBlue,
  },
  pickerText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: "600",
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
  submitBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.actionBlue,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnPressed: {
    opacity: 0.9,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
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
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  bankOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  bankOptionActive: {
    borderColor: Colors.actionBlue,
    backgroundColor: Colors.lightBlue,
  },
  bankOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  bankOptionTextActive: {
    fontWeight: "700",
    color: Colors.actionBlue,
  },
});
