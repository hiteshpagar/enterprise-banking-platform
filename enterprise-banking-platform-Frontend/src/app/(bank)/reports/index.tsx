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
import { Ionicons } from "@expo/vector-icons";
import { fetchTransactions } from "@/services/transactionService";
import { fetchReportSummary } from "@/services/reportService";
import type { ReportSummary } from "@/api/reports";
import { Colors } from "@/constants/theme";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { BottomNavBar } from "@/components/common/BottomNavBar";

interface ReportItem {
  id: string;
  title: string;
  category: string;
  description: string;
}

export default function BankReportsScreen() {
  const [search, setSearch] = useState("");
  const [todayTxnCount, setTodayTxnCount] = useState<number | null>(null);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Active Report Modal state
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      try {
        const [txRes, summaryRes] = await Promise.allSettled([
          fetchTransactions({ page: 0, size: 50 }),
          fetchReportSummary(),
        ]);

        if (txRes.status === "fulfilled") {
          setTodayTxnCount(txRes.value.totalElements || txRes.value.content?.length || 0);
        }
        if (summaryRes.status === "fulfilled") {
          setSummary(summaryRes.value);
        }
      } catch (err) {
        console.error("Reports stats load error", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const popularReports: ReportItem[] = [
    {
      id: "daily_tx",
      title: "Daily Transaction Report",
      category: "Transactions",
      description: "Detailed daily record of deposits, withdrawals, and interbank transfers.",
    },
    {
      id: "acc_summary",
      title: "Account Summary Report",
      category: "Accounts",
      description: "Overall count and deposit breakdown across Savings and Current accounts.",
    },
    {
      id: "cust_summary",
      title: "Customer Summary Report",
      category: "Customers",
      description: "Overview of registered bank customers and account ownership distribution.",
    },
    {
      id: "branch_perf",
      title: "Branch Performance Report",
      category: "Analytics",
      description: "Key operational health metrics, total volume processed, and active user stats.",
    },
    {
      id: "deposit_summary",
      title: "Deposit Summary Report",
      category: "Deposits",
      description: "Comprehensive log of total credits, debits, and net balance movement.",
    },
  ];

  const filteredReports = popularReports.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Reports & Analytics" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainWrapper}>
          {/* Search bar */}
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search report by title or category..."
              style={styles.searchInput}
            />
          </View>

          {/* Quick Analytics Grid */}
          <Text style={styles.sectionTitle}>Quick Analytics</Text>
          {isLoading ? (
            <ActivityIndicator color={Colors.actionBlue} size="large" style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.analyticsGrid}>
              <View style={styles.gridRow}>
                <View style={styles.analyticsCard}>
                  <Text style={styles.analyticsLabel}>Today's Transactions</Text>
                  <Text style={styles.analyticsVal}>{todayTxnCount !== null ? todayTxnCount : "-"}</Text>
                </View>
                <View style={styles.analyticsCard}>
                  <Text style={styles.analyticsLabel}>Total Credits</Text>
                  <Text style={styles.analyticsVal}>
                    ₹{(summary?.totalCredits || 0).toLocaleString("en-IN")}
                  </Text>
                </View>
              </View>
              <View style={styles.gridRow}>
                <View style={styles.analyticsCard}>
                  <Text style={styles.analyticsLabel}>Total Debits</Text>
                  <Text style={styles.analyticsVal}>
                    ₹{(summary?.totalDebits || 0).toLocaleString("en-IN")}
                  </Text>
                </View>
                <View style={styles.analyticsCard}>
                  <Text style={styles.analyticsLabel}>Net Amount</Text>
                  <Text style={styles.analyticsVal}>
                    ₹{(summary?.netAmount || 0).toLocaleString("en-IN")}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Popular Reports List */}
          <Text style={styles.sectionTitle}>Popular Reports</Text>
          <View style={styles.reportsList}>
            {filteredReports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportIconCircle}>
                  <Ionicons name="document-text" size={20} color={Colors.actionBlue} />
                </View>
                <View style={styles.reportTextGroup}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportCategory}>{report.category}</Text>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.viewBtn, pressed && styles.pressed]}
                  onPress={() => setSelectedReport(report)}
                >
                  <Text style={styles.viewBtnText}>View</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Interactive Report Detail Modal */}
      <Modal visible={!!selectedReport} transparent animationType="slide" onRequestClose={() => setSelectedReport(null)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setSelectedReport(null)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedReport?.title}</Text>
                <Text style={styles.modalSubTitle}>{selectedReport?.category} Report • Real-time Data</Text>
              </View>
              <Pressable onPress={() => setSelectedReport(null)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <View style={styles.modalBody}>
                <Text style={styles.reportDesc}>{selectedReport?.description}</Text>

                {/* Report Key Stats Section */}
                <View style={styles.statsCard}>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Total Customers</Text>
                    <Text style={styles.statVal}>{summary?.totalCustomers ?? "-"}</Text>
                  </View>
                  <View style={styles.divider} />

                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Total Active Accounts</Text>
                    <Text style={styles.statVal}>{summary?.totalAccounts ?? "-"}</Text>
                  </View>
                  <View style={styles.divider} />

                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Savings Accounts Count</Text>
                    <Text style={styles.statVal}>{summary?.savingsAccountsCount ?? "-"}</Text>
                  </View>
                  <View style={styles.divider} />

                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Current Accounts Count</Text>
                    <Text style={styles.statVal}>{summary?.currentAccountsCount ?? "-"}</Text>
                  </View>
                  <View style={styles.divider} />

                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Savings Total Balance</Text>
                    <Text style={styles.statVal}>₹{(summary?.savingsTotalBalance || 0).toLocaleString("en-IN")}.00</Text>
                  </View>
                  <View style={styles.divider} />

                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Current Total Balance</Text>
                    <Text style={styles.statVal}>₹{(summary?.currentTotalBalance || 0).toLocaleString("en-IN")}.00</Text>
                  </View>
                  <View style={styles.divider} />

                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Total System Transactions</Text>
                    <Text style={styles.statVal}>{summary?.totalTransactions ?? "-"}</Text>
                  </View>
                </View>

                {/* Status Notice */}
                <View style={styles.statusBox}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={Colors.success} />
                  <Text style={styles.statusText}>Report generated successfully from current live ledger data.</Text>
                </View>

                <Pressable style={styles.closeBtn} onPress={() => setSelectedReport(null)}>
                  <Text style={styles.closeBtnText}>Close Report</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  reportsList: {
    gap: 10,
    marginBottom: 24,
  },
  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reportIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reportTextGroup: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  reportCategory: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  viewBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.lightBlue,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  pressed: {
    opacity: 0.8,
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.actionBlue,
  },
  analyticsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
  },
  analyticsLabel: {
    fontSize: 12,
    color: "#D5E3FF",
    fontWeight: "600",
  },
  analyticsVal: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 4,
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  modalSubTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.actionBlue,
    marginTop: 2,
  },
  modalBody: {
    gap: 14,
  },
  reportDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  statsCard: {
    backgroundColor: Colors.lightBlue,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  statVal: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: "#DBEAFE",
  },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#DCFCE7",
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.success,
    flex: 1,
  },
  closeBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.actionBlue,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  closeBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
