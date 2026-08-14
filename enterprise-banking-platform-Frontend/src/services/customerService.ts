import { createCustomer } from "../api/customers";
import type {
  CreateCustomerRequest,
  Customer,
} from "../types/customer";

export async function onboardCustomer(
  request: CreateCustomerRequest
): Promise<Customer> {
  return createCustomer(request);
}
