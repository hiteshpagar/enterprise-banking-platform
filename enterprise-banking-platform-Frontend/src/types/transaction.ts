export type TransactionType = "DEPOSIT" | "WITHDRAWAL";
export type TransactionStatus = "COMPLETED" | "FAILED" | "PENDING";

export interface TransactionSummary {
  id: string;
  transactionReference: string;
  accountId: string;
  accountNumber: string;
  transactionType: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  createdAt: string;
}

export interface TransactionResponse {
  id: string;
  accountId: string;
  accountNumber: string;
  transactionReference: string;
  transactionType: TransactionType;
  amount: number;
  currency: string;
  balanceBefore: number;
  balanceAfter: number;
  status: TransactionStatus;
  description?: string;
  createdAt: string;
}

export interface TransactionPage {
  content: TransactionSummary[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface TransactionListParams {
  accountId?: string;
  page?: number;
  size?: number;
  sortBy?: string;
}

export type ActivityKind = "DEPOSIT" | "WITHDRAWAL" | "TRANSFER_OUT" | "TRANSFER_IN";

export interface CombinedActivityItem {
  id: string;
  reference: string;
  kind: ActivityKind;
  amount: number;
  currency: string;
  status: TransactionStatus;
  createdAt: string;
  sourceAccount?: string;
  destinationAccount?: string;
  description?: string;
}
