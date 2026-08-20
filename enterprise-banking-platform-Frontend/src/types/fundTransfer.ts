export type TransferStatus = "COMPLETED" | "FAILED" | "PENDING";

export interface CreateTransferRequest {
  sourceAccountId: string;
  destinationAccountId?: string;
  destinationAccountNumber?: string;
  amount: number;
  description?: string;
}

export interface TransferSummary {
  id: string;
  transferReference: string;
  sourceAccountId: string;
  sourceAccountNumber: string;
  destinationAccountId: string;
  destinationAccountNumber: string;
  amount: number;
  currency: string;
  status: TransferStatus;
  createdAt: string;
}

export interface TransferResponse {
  id: string;
  sourceAccountId: string;
  sourceAccountNumber: string;
  destinationAccountId: string;
  destinationAccountNumber: string;
  transferReference: string;
  amount: number;
  currency: string;
  status: TransferStatus;
  description?: string;
  createdAt: string;
}

export interface TransferPage {
  content: TransferSummary[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
