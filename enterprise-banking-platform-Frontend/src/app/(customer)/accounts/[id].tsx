import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchAccountDetails } from "@/services/accountService";
import type { Account } from "@/types/account";
import { Colors } from "@/constants/theme";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { BottomNavBar } from "@/components/common/BottomNavBar";

export default function AccountDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal States
  const [activeModal, setActiveModal] = useState<"DOWNLOAD" | "SHARE" | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("Last 30 Days");
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      if (!id) return;
      setIsLoading(true);
      setError("");
      try {
        const res = await fetchAccountDetails(id, true);
        setAccount(res);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to load account details");
      } finally {
        setIsLoading(false);
      }
    }
    loadDetails();
  }, [id]);

  const accType = account?.accountType === "SAVINGS" ? "Savings Account" : account?.accountType === "CURRENT" ? "Current Account" : account?.accountType || "";
  const accNum = account?.accountNumber ? `•••• •••• ${account.accountNumber.slice(-4)}` : "";
  const balance = account?.balance ?? 0;
  const holder = account?.customerName || "";
  const openedOn = account?.createdAt ? new Date(account.createdAt).toLocaleDateString("en-IN") : "";

  function handleGenerateStatement() {
    setIsGenerating(true);
    setDownloadSuccess(false);
    setTimeout(() => {
      setIsGenerating(false);
      setDownloadSuccess(true);
    }, 800);
  }

  function handleShareAccountDetails() {
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Account Details" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainWrapper}>
          {isLoading ? (
            <ActivityIndicator color={Colors.actionBlue} size="large" style={{ marginVertical: 30 }} />
          ) : error || !account ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={24} color={Colors.danger} />
              <Text style={styles.errorText}>{error || "Account not found"}</Text>
            </View>
          ) : (
            <>
              {/* Top Hero Blue Card */}
              <View style={styles.heroCard}>
                <View style={styles.heroHeader}>
                  <Text style={styles.heroAccType}>{accType}</Text>
                  <Text style={styles.heroAccNum}>{accNum}</Text>
                </View>
                <View style={styles.heroBalanceGroup}>
                  <Text style={styles.heroBalanceLabel}>Available Balance</Text>
                  <Text style={styles.heroBalance}>₹{balance.toLocaleString("en-IN")}.00</Text>
                </View>
              </View>

              {/* Details List */}
              <View style={styles.detailsCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account Type</Text>
                  <Text style={styles.detailValue}>{accType}</Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account Number</Text>
                  <Text style={styles.detailValue}>{account.accountNumber}</Text>
                </View>
                <View style={styles.divider} />

                {holder ? (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Account Holder</Text>
                      <Text style={styles.detailValueBold}>{holder}</Text>
                    </View>
                    <View style={styles.divider} />
                  </>
                ) : null}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={styles.detailValueBold}>{account.status}</Text>
                </View>
                <View style={styles.divider} />

                {openedOn ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Opened On</Text>
                    <Text style={styles.detailValue}>{openedOn}</Text>
                  </View>
                ) : null}
              </View>

              {/* Quick Actions Bar */}
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsRow}>
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                  onPress={() => router.push("/(customer)/transactions" as Href)}
                >
                  <Ionicons name="document-text-outline" size={20} color={Colors.actionBlue} />
                  <Text style={styles.actionBtnText}>Statement</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                  onPress={() => {
                    setDownloadSuccess(false);
                    setActiveModal("DOWNLOAD");
                  }}
                >
                  <Ionicons name="download-outline" size={20} color={Colors.actionBlue} />
                  <Text style={styles.actionBtnText}>Download Statement</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                  onPress={() => setActiveModal("SHARE")}
                >
                  <Ionicons name="share-social-outline" size={20} color={Colors.actionBlue} />
                  <Text style={styles.actionBtnText}>Share Details</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Modal 1: Download Statement */}
      <Modal
        visible={activeModal === "DOWNLOAD"}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Download Account Statement</Text>
              <Pressable onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.modalForm}>
              <Text style={styles.fieldLabel}>Select Statement Period</Text>
              <View style={styles.chipRow}>
                {["Last 30 Days", "Last 3 Months", "Last 6 Months", "Financial Year"].map((period) => (
                  <Pressable
                    key={period}
                    style={[styles.chip, selectedPeriod === period && styles.chipActive]}
                    onPress={() => setSelectedPeriod(period)}
                  >
                    <Text style={[styles.chipText, selectedPeriod === period && styles.chipTextActive]}>
                      {period}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {downloadSuccess ? (
                <View style={styles.successBox}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                  <Text style={styles.successText}>
                    Statement for {selectedPeriod} generated successfully!
                  </Text>
                </View>
              ) : null}

              <Pressable style={styles.primaryBtn} onPress={handleGenerateStatement} disabled={isGenerating}>
                {isGenerating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Generate PDF Statement</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Share Details */}
      <Modal
        visible={activeModal === "SHARE"}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Account Details</Text>
              <Pressable onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.shareCard}>
                <View style={styles.shareRow}>
                  <Text style={styles.shareLabel}>Account Number</Text>
                  <Text style={styles.shareVal}>{account?.accountNumber}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.shareRow}>
                  <Text style={styles.shareLabel}>IFSC Code</Text>
                  <Text style={styles.shareVal}>EBP0001089</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.shareRow}>
                  <Text style={styles.shareLabel}>Bank Name</Text>
                  <Text style={styles.shareVal}>Enterprise Banking Platform</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.shareRow}>
                  <Text style={styles.shareLabel}>Branch</Text>
                  <Text style={styles.shareVal}>Main Head Office</Text>
                </View>
              </View>

              {copySuccess ? (
                <View style={styles.successBox}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                  <Text style={styles.successText}>Account details copied to clipboard!</Text>
                </View>
              ) : null}

              <Pressable style={styles.primaryBtn} onPress={handleShareAccountDetails}>
                <Ionicons name="copy-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.primaryBtnText}>Copy Account Details</Text>
              </Pressable>
            </View>
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
  heroCard: {
    backgroundColor: Colors.actionBlue,
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    shadowColor: Colors.actionBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  heroAccType: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  heroAccNum: {
    fontSize: 13,
    color: "#D5E3FF",
    fontWeight: "600",
  },
  heroBalanceGroup: {
    marginTop: 4,
  },
  heroBalanceLabel: {
    fontSize: 13,
    color: "#D5E3FF",
  },
  heroBalance: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 2,
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  detailValueBold: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  pressed: {
    opacity: 0.8,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  errorBox: {
    padding: 24,
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.danger,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
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
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.lightBlue,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.actionBlue,
    borderColor: Colors.actionBlue,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.actionBlue,
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  primaryBtn: {
    flexDirection: "row",
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.actionBlue,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#DCFCE7",
    borderRadius: 10,
  },
  successText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.success,
    flex: 1,
  },
  shareCard: {
    backgroundColor: Colors.lightBlue,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  shareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  shareLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  shareVal: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
});
