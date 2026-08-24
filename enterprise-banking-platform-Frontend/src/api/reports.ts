import { apiRequest } from "./client";

export interface ReportSummary {
  totalCustomers: number;
  totalAccounts: number;
  totalTransactions: number;
  totalCredits: number;
  totalDebits: number;
  netAmount: number;
  savingsAccountsCount: number;
  currentAccountsCount: number;
  savingsTotalBalance: number;
  currentTotalBalance: number;
}

export async function getReportSummaryApi(): Promise<ReportSummary> {
  return apiRequest<ReportSummary>(
    "/reports/summary",
    {
      method: "GET",
    },
    true
  );
}
