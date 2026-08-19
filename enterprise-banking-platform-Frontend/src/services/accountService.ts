import {
  getAccounts,
  getAccountById,
  createAccount,
  getCurrentCustomerAccountById,
  getCurrentCustomerAccounts,
} from "../api/accounts";

import type {
  Account,
  AccountListParams,
  AccountPage,
  CreateAccountRequest,
} from "../types/account";

export async function fetchAccounts(
  params: AccountListParams = {},
  isCustomer = true,
): Promise<AccountPage> {
  return isCustomer ? getCurrentCustomerAccounts(params) : getAccounts(params);
}

export async function fetchAccountDetails(
  id: string,
  isCustomer = true,
): Promise<Account> {
  return isCustomer ? getCurrentCustomerAccountById(id) : getAccountById(id);
}

export async function openAccount(
  request: CreateAccountRequest,
): Promise<Account> {
  return createAccount(request);
}
