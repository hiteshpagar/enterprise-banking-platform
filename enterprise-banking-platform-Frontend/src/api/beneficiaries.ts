import { apiRequest } from "./client";
import type {
  Beneficiary,
  BeneficiaryPage,
  CreateCustomerBeneficiaryRequest,
  UpdateBeneficiaryRequest,
} from "../types/beneficiary";

export async function getCurrentCustomerBeneficiaries(
  page = 0,
  size = 10
): Promise<BeneficiaryPage> {
  return apiRequest<BeneficiaryPage>(
    `/beneficiaries/me?page=${page}&size=${size}`,
    {
      method: "GET",
    },
    true
  );
}

export async function createCustomerBeneficiary(
  request: CreateCustomerBeneficiaryRequest
): Promise<Beneficiary> {
  return apiRequest<Beneficiary>(
    "/beneficiaries/me",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    true
  );
}

export async function getCustomerBeneficiaryById(
  id: string
): Promise<Beneficiary> {
  return apiRequest<Beneficiary>(
    `/beneficiaries/me/${id}`,
    {
      method: "GET",
    },
    true
  );
}

export async function updateCustomerBeneficiary(
  id: string,
  request: UpdateBeneficiaryRequest
): Promise<Beneficiary> {
  return apiRequest<Beneficiary>(
    `/beneficiaries/me/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
    true
  );
}

export async function deleteCustomerBeneficiary(
  id: string
): Promise<void> {
  return apiRequest<void>(
    `/beneficiaries/me/${id}`,
    {
      method: "DELETE",
    },
    true
  );
}
