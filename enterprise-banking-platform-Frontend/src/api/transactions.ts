import { apiRequest } from "./client";
import type {
  TransactionPage,
  TransactionResponse,
} from "../types/transaction";

export async function getTransactionsByAccount(
  accountId: string,
  page = 0,
  size = 10
): Promise<TransactionPage> {
  return apiRequest<TransactionPage>(
    `/transactions/account/${accountId}?page=${page}&size=${size}`,
    {
      method: "GET",
    },
    true
  );
}

export async function getTransactionById(
  id: string
): Promise<TransactionResponse> {
  return apiRequest<TransactionResponse>(
    `/transactions/${id}`,
    {
      method: "GET",
    },
    true
  );
}
