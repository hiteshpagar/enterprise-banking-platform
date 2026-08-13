export type AccountStatus = "ACTIVE" | "BLOCKED" | "FROZEN" | "CLOSED";

export type AccountType = "SAVINGS" | "CURRENT" | "SALARY";

export interface AccountSummary {
  id: string;
  accountNumber: string;
  customerName: string;
  accountType: AccountType;
  balance: number;
  status: AccountStatus;
  currency: string;
}

export interface Account extends AccountSummary {
  customerId: string;
  openedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountPage {
  content: AccountSummary[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface AccountListParams {
  page?: number;
  size?: number;
  sortBy?: "accountNumber" | "accountType" | "balance" | "status" | "currency";
  search?: string;
}
