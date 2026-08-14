import { apiRequest } from "./client";
import type {
  CreateCustomerRequest,
  Customer,
} from "../types/customer";

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
