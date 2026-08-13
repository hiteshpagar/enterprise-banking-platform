import {
  getAccountById,
  getAccounts,
} from "../api/accounts";
import type {
  Account,
  AccountListParams,
  AccountPage,
} from "../types/account";

export async function fetchAccounts(
  params: AccountListParams = {}
): Promise<AccountPage> {
  return getAccounts(params);
}

export async function fetchAccountDetails(
  id: string
): Promise<Account> {
  return getAccountById(id);
}
