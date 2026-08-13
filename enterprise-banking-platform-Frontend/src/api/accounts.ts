import { apiRequest } from "./client";
import type {
  Account,
  AccountListParams,
  AccountPage,
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
