import {
  createCustomer,
  getCustomers,
} from "../api/customers";

import type {
  CreateCustomerRequest,
  Customer,
  CustomerPage,
} from "../types/customer";

export async function onboardCustomer(
  request: CreateCustomerRequest
): Promise<Customer> {
  return createCustomer(request);
}

export async function fetchCustomers(
  params: {
    page?: number;
    size?: number;
    sortBy?: string;
    search?: string;
  } = {}
): Promise<CustomerPage> {
  return getCustomers(params);
}