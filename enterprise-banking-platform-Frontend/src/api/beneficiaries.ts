import { apiRequest } from "./client";
import type {
  Beneficiary,
  BeneficiaryPage,
  BeneficiaryStatus,
  CreateCustomerBeneficiaryRequest,
  UpdateBeneficiaryRequest,
} from "@/types/beneficiary";

export async function getCurrentCustomerBeneficiaries(
  page = 0,
  size = 10,
  status?: BeneficiaryStatus
): Promise<BeneficiaryPage> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  if (status) {
    queryParams.append("status", status);
  }
  return apiRequest<BeneficiaryPage>(
    `/beneficiaries/me?${queryParams.toString()}`,
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
