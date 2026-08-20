import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { BeneficiaryStatusBadge } from "../../../components/beneficiaries/BeneficiaryStatusBadge";
import {
  editCustomerBeneficiary,
  fetchCustomerBeneficiaryDetails,
  removeCustomerBeneficiary,
} from "../../../services/beneficiaryService";
import type { Beneficiary, BeneficiaryStatus } from "../../../types/beneficiary";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function BeneficiaryDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBank, setEditBank] = useState("");
  const [editStatus, setEditStatus] = useState<BeneficiaryStatus>("ACTIVE");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  // Deleting State
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadBeneficiary() {
    if (!id) {
      setError("Beneficiary ID is missing.");
      setIsLoading(false);
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetchCustomerBeneficiaryDetails(id);
      setBeneficiary(response);
      setEditName(response.beneficiaryName);
      setEditBank(response.bankName || "");
      setEditStatus(response.status);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load beneficiary details."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBeneficiary();
  }, [id]);

  async function handleUpdate() {
    if (!id) return;
    if (!editName.trim()) {
      setEditError("Beneficiary name is required.");
      return;
    }

    setEditError("");
    setIsUpdating(true);

    try {
      const updated = await editCustomerBeneficiary(id, {
        beneficiaryName: editName.trim(),
        bankName: editBank.trim() || undefined,
        status: editStatus,
      });

      setBeneficiary(updated);
      setIsEditModalVisible(false);
    } catch (err) {
      setEditError(
        err instanceof Error
          ? err.message
          : "Failed to update beneficiary."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete() {
    if (!id) return;

    Alert.alert(
      "Delete Beneficiary",
      `Are you sure you want to delete ${beneficiary?.beneficiaryName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await removeCustomerBeneficiary(id);
              router.back();
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "Failed to delete beneficiary."
              );
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <Text style={styles.eyebrow}>Beneficiary Details</Text>
        <Text style={styles.title}>
          {beneficiary?.beneficiaryName ?? "Beneficiary"}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#1D4ED8" />
          <Text style={styles.stateText}>Loading beneficiary details...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadBeneficiary} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : beneficiary ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.summaryPanel}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryMeta}>
                <Text style={styles.summaryName}>
                  {beneficiary.beneficiaryName}
                </Text>
                <Text style={styles.summaryBank}>
                  {beneficiary.bankName || "Bank"}
                </Text>
              </View>
              <BeneficiaryStatusBadge status={beneficiary.status} />
            </View>

            <View style={styles.accountBox}>
              <Text style={styles.accountBoxLabel}>Account Number</Text>
              <Text style={styles.accountBoxValue}>
                {beneficiary.accountNumber}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <DetailRow
              label="Beneficiary ID"
              value={beneficiary.id}
            />
            <DetailRow
              label="Linked Account ID"
              value={beneficiary.accountId}
            />
            <DetailRow
              label="Status"
              value={beneficiary.status}
            />
            <DetailRow
              label="Created Date"
              value={formatDate(beneficiary.createdAt)}
            />
            <DetailRow
              label="Last Updated"
              value={formatDate(beneficiary.updatedAt)}
            />
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => {
                setEditName(beneficiary.beneficiaryName);
                setEditBank(beneficiary.bankName || "");
                setEditStatus(beneficiary.status);
                setIsEditModalVisible(true);
              }}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>Edit Beneficiary</Text>
            </Pressable>

            <Pressable
              onPress={handleDelete}
              disabled={isDeleting}
              style={styles.deleteButton}
            >
              {isDeleting ? (
                <ActivityIndicator color="#DC2626" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete Beneficiary</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      ) : null}

      {/* Edit Beneficiary Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Beneficiary</Text>

            {editError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{editError}</Text>
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Beneficiary Name *</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Bank Name</Text>
              <TextInput
                value={editBank}
                onChangeText={setEditBank}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Status</Text>
              <View style={styles.statusToggleRow}>
                <Pressable
                  onPress={() => setEditStatus("ACTIVE")}
                  style={[
                    styles.statusOption,
                    editStatus === "ACTIVE" && styles.statusOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      editStatus === "ACTIVE" && styles.statusOptionTextActive,
                    ]}
                  >
                    ACTIVE
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setEditStatus("INACTIVE")}
                  style={[
                    styles.statusOption,
                    editStatus === "INACTIVE" && styles.statusOptionInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      editStatus === "INACTIVE" && styles.statusOptionTextInactive,
                    ]}
                  >
                    INACTIVE
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setIsEditModalVisible(false)}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleUpdate}
                disabled={isUpdating}
                style={styles.modalSaveButton}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Save Changes</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    gap: 18,
    padding: 20,
  },
  summaryPanel: {
    gap: 16,
    borderRadius: 8,
    padding: 20,
    backgroundColor: "#111827",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  summaryMeta: {
    flex: 1,
    gap: 4,
  },
  summaryName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  summaryBank: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
  accountBox: {
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingTop: 12,
  },
  accountBoxLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  accountBoxValue: {
    marginTop: 4,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1,
  },
  section: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  detailRow: {
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    padding: 16,
  },
  detailLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  detailValue: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  editButton: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#1D4ED8",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  deleteButton: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  deleteButtonText: {
    color: "#DC2626",
    fontSize: 15,
    fontWeight: "700",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  stateText: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 15,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 15,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#111827",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    backgroundColor: "#FFFFFF",
    gap: 16,
  },
  modalTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "800",
  },
  errorBox: {
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#FEF2F2",
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 14,
    color: "#111827",
    fontSize: 15,
  },
  statusToggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  statusOption: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  statusOptionActive: {
    borderColor: "#059669",
    backgroundColor: "#ECFDF5",
  },
  statusOptionInactive: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  statusOptionText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
  },
  statusOptionTextActive: {
    color: "#065F46",
  },
  statusOptionTextInactive: {
    color: "#991B1B",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  modalCancelButton: {
    flex: 1,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#EEF2F7",
  },
  modalCancelText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },
  modalSaveButton: {
    flex: 1,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#1D4ED8",
  },
  modalSaveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
