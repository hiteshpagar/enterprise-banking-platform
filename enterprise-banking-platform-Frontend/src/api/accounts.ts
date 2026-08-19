import { apiRequest } from "./client";
import type {
  Account,
  AccountListParams,
  AccountPage,
  CreateAccountRequest,
} from "../types/account";

function toQueryString(params: AccountListParams) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

export async function getAccounts(
  params: AccountListParams = {}
): Promise<AccountPage> {
  return apiRequest<AccountPage>(
    `/accounts${toQueryString(params)}`,
    {
      method: "GET",
    },
    true
  );
}

export async function getAccountById(id: string): Promise<Account> {
  return apiRequest<Account>(
    `/accounts/${id}`,
    {
      method: "GET",
    },
    true
  );
}

export async function getCurrentCustomerAccounts(
  params: AccountListParams = {}
): Promise<AccountPage> {
  return apiRequest<AccountPage>(
    `/accounts/me${toQueryString(params)}`,
    {
      method: "GET",
    },
    true
  );
}

export async function getCurrentCustomerAccountById(
  id: string
): Promise<Account> {
  return apiRequest<Account>(
    `/accounts/me/${id}`,
    {
      method: "GET",
    },
    true
  );
}

export async function createAccount(
  request: CreateAccountRequest
): Promise<Account> {
  return apiRequest<Account>(
    "/accounts",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    true
  );
}
