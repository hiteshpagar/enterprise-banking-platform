import { getTransactionsByAccount as getTransactionsByAccountApi } from "@/api/transactions";
import { getTransfersByAccount as getTransfersByAccountApi } from "@/api/fundTransfers";
import type {
  CombinedActivityItem,
  TransactionPage,
  TransactionListParams,
} from "@/types/transaction";

export async function fetchTransactionsByAccount(
  accountId: string,
  page = 0,
  size = 10
): Promise<TransactionPage> {
  return getTransactionsByAccountApi(accountId, page, size);
}

export async function fetchTransactions(
  params: TransactionListParams = {}
): Promise<TransactionPage> {
  const accountId = params.accountId || "1";
  const page = params.page || 0;
  const size = params.size || 10;
  return getTransactionsByAccountApi(accountId, page, size);
}

export async function fetchCombinedAccountActivity(
  accountId: string,
  targetAccountNumber?: string,
  page = 0,
  size = 10
): Promise<{
  items: CombinedActivityItem[];
  hasMore: boolean;
  totalElements: number;
}> {
  const [txnPage, trfPage] = await Promise.all([
    getTransactionsByAccountApi(accountId, page, size),
    getTransfersByAccountApi(accountId, page, size),
  ]);

  const items: CombinedActivityItem[] = [];

  txnPage.content.forEach((t) => {
    items.push({
      id: `txn-${t.id}`,
      reference: t.transactionReference,
      kind: t.transactionType,
      amount: t.amount,
      currency: t.currency,
      status: t.status,
      createdAt: t.createdAt,
      sourceAccount: t.accountNumber,
    });
  });

  trfPage.content.forEach((t) => {
    const isDebit =
      t.sourceAccountId === accountId ||
      (targetAccountNumber && t.sourceAccountNumber === targetAccountNumber);

    items.push({
      id: `trf-${t.id}`,
      reference: t.transferReference,
      kind: isDebit ? "TRANSFER_OUT" : "TRANSFER_IN",
      amount: t.amount,
      currency: t.currency,
      status: t.status,
      createdAt: t.createdAt,
      sourceAccount: t.sourceAccountNumber,
      destinationAccount: t.destinationAccountNumber,
    });
  });

  // Sort descending by date
  items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const hasMore = !txnPage.last || !trfPage.last;
  const totalElements = txnPage.totalElements + trfPage.totalElements;

  return {
    items,
    hasMore,
    totalElements,
  };
}
