import { apiRequest } from "./client";
import type {
  CreateCustomerRequest,
  Customer,
  CustomerPage,
} from "@/types/customer";

export async function createCustomer(
  request: CreateCustomerRequest
): Promise<Customer> {
  return apiRequest<Customer>(
    "/customers",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    true
  );
}

export async function getCustomers(
  params: {
    page?: number;
    size?: number;
    sortBy?: string;
    search?: string;
  } = {}
): Promise<CustomerPage> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();

  return apiRequest<CustomerPage>(
    `/customers${query ? `?${query}` : ""}`,
    {
      method: "GET",
    },
    true
  );
}

export async function getCustomerById(id: string): Promise<Customer> {
  return apiRequest<Customer>(
    `/customers/${id}`,
    {
      method: "GET",
    },
    true
  );
}