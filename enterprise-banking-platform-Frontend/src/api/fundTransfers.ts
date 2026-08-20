import { apiRequest } from "./client";
import type {
  CreateTransferRequest,
  TransferPage,
  TransferResponse,
} from "../types/fundTransfer";

export async function createTransfer(
  request: CreateTransferRequest
): Promise<TransferResponse> {
  return apiRequest<TransferResponse>(
    "/transfers",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    true
  );
}

export async function getTransferById(id: string): Promise<TransferResponse> {
  return apiRequest<TransferResponse>(
    `/transfers/${id}`,
    {
      method: "GET",
    },
    true
  );
}

export async function getTransfersByAccount(
  accountId: string,
  page = 0,
  size = 10
): Promise<TransferPage> {
  return apiRequest<TransferPage>(
    `/transfers/account/${accountId}?page=${page}&size=${size}`,
    {
      method: "GET",
    },
    true
  );
}
