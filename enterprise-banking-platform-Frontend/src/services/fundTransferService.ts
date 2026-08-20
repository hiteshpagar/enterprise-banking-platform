import {
  createTransfer as createTransferApi,
  getTransferById as getTransferByIdApi,
  getTransfersByAccount as getTransfersByAccountApi,
} from "../api/fundTransfers";
import type {
  CreateTransferRequest,
  TransferPage,
  TransferResponse,
} from "../types/fundTransfer";

export async function initiateTransfer(
  request: CreateTransferRequest
): Promise<TransferResponse> {
  return createTransferApi(request);
}

export async function fetchTransferDetails(
  id: string
): Promise<TransferResponse> {
  return getTransferByIdApi(id);
}

export async function fetchTransfersByAccount(
  accountId: string,
  page = 0,
  size = 10
): Promise<TransferPage> {
  return getTransfersByAccountApi(accountId, page, size);
}
