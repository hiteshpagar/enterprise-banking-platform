import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { router, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchBeneficiaries,
  editCustomerBeneficiary,
  removeCustomerBeneficiary,
} from "@/services/beneficiaryService";
import type { Beneficiary, BeneficiaryStatus } from "@/types/beneficiary";
import { Colors } from "@/constants/theme";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { BottomNavBar } from "@/components/common/BottomNavBar";

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

export default function BeneficiariesScreen() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<Beneficiary | null>(null);
  const [editName, setEditName] = useState("");
  const [editBank, setEditBank] = useState("");
  const [customBankName, setCustomBankName] = useState("");
  const [isCustomBank, setIsCustomBank] = useState(false);
  const [editStatus, setEditStatus] = useState<BeneficiaryStatus>("ACTIVE");
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankSearch, setBankSearch] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete Modal State
  const [deletingItem, setDeletingItem] = useState<Beneficiary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadData() {
    setIsLoading(true);
    try {
      const res = await fetchBeneficiaries();
      setBeneficiaries(res || []);
    } catch (err) {
      console.error("Beneficiaries load error", err);
      setBeneficiaries([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function startEdit(item: Beneficiary) {
    setEditingItem(item);
    setEditName(item.beneficiaryName || "");
    const bank = item.bankName || "HDFC Bank";
    if (INDIAN_BANKS.includes(bank)) {
      setEditBank(bank);
      setIsCustomBank(false);
    } else {
      setEditBank("Other Bank");
      setCustomBankName(bank);
      setIsCustomBank(true);
    }
    setEditStatus(item.status || "ACTIVE");
    setEditError("");
  }

  function handleSelectBank(bank: string) {
    if (bank === "Other Bank (Enter custom name)") {
      setIsCustomBank(true);
      setEditBank("Other Bank");
    } else {
      setIsCustomBank(false);
      setEditBank(bank);
    }
    setShowBankModal(false);
  }

  async function saveEdit() {
    if (!editingItem) return;
    if (!editName.trim()) {
      setEditError("Beneficiary name is required");
      return;
    }
    const finalBank = isCustomBank ? customBankName.trim() : editBank;
    if (isCustomBank && !finalBank) {
      setEditError("Please enter custom bank name");
      return;
    }

    setIsSaving(true);
    setEditError("");
    try {
      const updated = await editCustomerBeneficiary(editingItem.id, {
        beneficiaryName: editName.trim(),
        bankName: finalBank,
        status: editStatus,
      });

      setBeneficiaries((prev) =>
        prev.map((b) => (b.id === editingItem.id ? { ...b, ...updated } : b))
      );
      setEditingItem(null);
    } catch (err) {
      if (err instanceof Error) setEditError(err.message);
      else setEditError("Failed to update beneficiary");
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await removeCustomerBeneficiary(deletingItem.id);
      setBeneficiaries((prev) => prev.filter((b) => b.id !== deletingItem.id));
      setDeletingItem(null);
    } catch (err) {
      console.error("Delete beneficiary error", err);
      Alert.alert("Error", "Failed to delete beneficiary");
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredBanks = INDIAN_BANKS.filter((b) =>
    b.toLowerCase().includes(bankSearch.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="My Beneficiaries"
        showBack={true}
        rightLabel="+ Add"
        onRightPress={() => router.push("/(customer)/beneficiaries/add" as Href)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainWrapper}>
          {isLoading ? (
            <ActivityIndicator color={Colors.actionBlue} size="large" style={{ marginVertical: 30 }} />
          ) : beneficiaries.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="people-outline" size={40} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>No beneficiaries added yet</Text>
              <Pressable
                style={styles.addBtn}
                onPress={() => router.push("/(customer)/beneficiaries/add" as Href)}
              >
                <Text style={styles.addBtnText}>+ Add Beneficiary</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.list}>
              {beneficiaries.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.avatarCircle}>
                    <Ionicons name="person" size={20} color={Colors.actionBlue} />
                  </View>

                  <View style={styles.info}>
                    <Text style={styles.name}>{item.beneficiaryName}</Text>
                    <Text style={styles.bankDetail}>
                      {item.bankName ? `${item.bankName} • ` : ""}•••• {item.accountNumber.slice(-4)}
                    </Text>
                    <View style={[styles.activePill, item.status !== "ACTIVE" && styles.inactivePill]}>
                      <Text style={[styles.activePillText, item.status !== "ACTIVE" && styles.inactivePillText]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  {/* Actions: Edit & Delete Icons */}
                  <View style={styles.actionRow}>
                    <Pressable
                      style={({ pressed }) => [styles.actionIconBtn, pressed && styles.pressed]}
                      onPress={() => startEdit(item)}
                    >
                      <Ionicons name="create-outline" size={20} color={Colors.actionBlue} />
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [styles.actionIconBtn, styles.deleteIconBtn, pressed && styles.pressed]}
                      onPress={() => setDeletingItem(item)}
                    >
                      <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit Beneficiary Modal */}
      <Modal visible={!!editingItem} transparent animationType="slide" onRequestClose={() => setEditingItem(null)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setEditingItem(null)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Beneficiary</Text>
              <Pressable onPress={() => setEditingItem(null)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              <View style={styles.modalForm}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Beneficiary Name</Text>
                  <TextInput value={editName} onChangeText={setEditName} style={styles.input} />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Bank Name</Text>
                  <Pressable style={styles.pickerBox} onPress={() => setShowBankModal(true)}>
                    <Text style={styles.pickerText}>{editBank}</Text>
                    <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
                  </Pressable>
                </View>

                {isCustomBank && (
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Custom Bank Name</Text>
                    <TextInput
                      value={customBankName}
                      onChangeText={setCustomBankName}
                      placeholder="Enter bank name"
                      style={styles.input}
                    />
                  </View>
                )}

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Status</Text>
                  <View style={styles.statusToggleRow}>
                    <Pressable
                      style={[styles.statusToggleBtn, editStatus === "ACTIVE" && styles.statusActiveBtn]}
                      onPress={() => setEditStatus("ACTIVE")}
                    >
                      <Text style={[styles.statusToggleText, editStatus === "ACTIVE" && styles.statusActiveText]}>
                        Active
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.statusToggleBtn, editStatus === "INACTIVE" && styles.statusInactiveBtn]}
                      onPress={() => setEditStatus("INACTIVE")}
                    >
                      <Text style={[styles.statusToggleText, editStatus === "INACTIVE" && styles.statusInactiveText]}>
                        Inactive
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {editError ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                    <Text style={styles.errorText}>{editError}</Text>
                  </View>
                ) : null}

                <Pressable style={styles.saveBtn} onPress={saveEdit} disabled={isSaving}>
                  {isSaving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={!!deletingItem} transparent animationType="fade" onRequestClose={() => setDeletingItem(null)}>
        <View style={styles.modalOverlayCenter}>
          <Pressable style={styles.modalBackdrop} onPress={() => setDeletingItem(null)} />
          <View style={styles.deleteCard}>
            <View style={styles.deleteIconBadge}>
              <Ionicons name="trash" size={32} color={Colors.danger} />
            </View>
            <Text style={styles.deleteTitle}>Delete Beneficiary?</Text>
            <Text style={styles.deleteSub}>
              Are you sure you want to remove{" "}
              <Text style={{ fontWeight: "700", color: Colors.textPrimary }}>{deletingItem?.beneficiaryName}</Text>?
              This action cannot be undone.
            </Text>

            <View style={styles.deleteActionRow}>
              <Pressable style={styles.cancelBtn} onPress={() => setDeletingItem(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmDeleteBtn} onPress={confirmDelete} disabled={isDeleting}>
                {isDeleting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.confirmDeleteText}>Delete</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Indian Banks Dropdown Modal */}
      <Modal visible={showBankModal} transparent animationType="slide" onRequestClose={() => setShowBankModal(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowBankModal(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Bank</Text>
              <Pressable onPress={() => setShowBankModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                value={bankSearch}
                onChangeText={setBankSearch}
                placeholder="Search bank name..."
                style={styles.searchInput}
              />
            </View>
            <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
              {filteredBanks.map((bankNameOption, idx) => {
                const isSelected = editBank === bankNameOption || (isCustomBank && bankNameOption.startsWith("Other"));
                return (
                  <Pressable
                    key={idx}
                    style={[styles.bankOptionCard, isSelected && styles.bankOptionActive]}
                    onPress={() => handleSelectBank(bankNameOption)}
                  >
                    <Ionicons
                      name={bankNameOption.startsWith("Other") ? "create-outline" : "business-outline"}
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
  list: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  bankDetail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activePill: {
    alignSelf: "flex-start",
    backgroundColor: Colors.lightBlue,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.actionBlue,
  },
  inactivePill: {
    backgroundColor: "#FEE2E2",
  },
  inactivePillText: {
    color: Colors.danger,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 8,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lightBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIconBtn: {
    backgroundColor: "#FEE2E2",
  },
  pressed: {
    opacity: 0.8,
  },
  emptyCard: {
    padding: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.actionBlue,
    marginTop: 4,
  },
  addBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalOverlayCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
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
  modalForm: {
    gap: 14,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
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
  pickerText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  statusToggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  statusToggleBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  statusActiveBtn: {
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
  },
  statusInactiveBtn: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
  },
  statusToggleText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  statusActiveText: {
    color: Colors.success,
  },
  statusInactiveText: {
    color: Colors.danger,
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
  saveBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.actionBlue,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  deleteCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 5,
  },
  deleteIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  deleteSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  deleteActionRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.lightBlue,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primary,
  },
  confirmDeleteBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmDeleteText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
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
