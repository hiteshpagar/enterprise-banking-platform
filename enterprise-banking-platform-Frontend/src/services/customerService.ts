import {
  createCustomer as createCustomerApi,
  getCustomers,
} from "@/api/customers";

import type {
  CreateCustomerRequest,
  Customer,
  CustomerPage,
} from "@/types/customer";

export async function onboardCustomer(
  request: CreateCustomerRequest
): Promise<Customer> {
  return createCustomerApi(request);
}

export async function createCustomer(
  request: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    panNumber?: string;
    aadhaarNumber?: string;
  }
): Promise<Customer> {
  return createCustomerApi({
    firstName: request.firstName,
    lastName: request.lastName,
    email: request.email,
    mobileNumber: request.phone,
    dateOfBirth: "",
    gender: "OTHER",
    status: "ACTIVE",
  });
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