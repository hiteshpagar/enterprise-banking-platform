import { getReportSummaryApi, type ReportSummary } from "@/api/reports";

export async function fetchReportSummary(): Promise<ReportSummary> {
  return getReportSummaryApi();
}
