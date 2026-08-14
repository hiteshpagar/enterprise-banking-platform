import {
  getCurrentCustomerAccountById,
  getCurrentCustomerAccounts,
} from "../api/accounts";
import type {
  Account,
  AccountListParams,
  AccountPage,
} from "../types/account";

export async function fetchAccounts(
  params: AccountListParams = {}
): Promise<AccountPage> {
  return getCurrentCustomerAccounts(params);
}

export async function fetchAccountDetails(
  id: string
): Promise<Account> {
  return getCurrentCustomerAccountById(id);
}
