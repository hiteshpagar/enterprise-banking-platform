import {
  getCurrentCustomerBeneficiaries,
  createCustomerBeneficiary,
  getCustomerBeneficiaryById,
  updateCustomerBeneficiary,
  deleteCustomerBeneficiary,
} from "@/api/beneficiaries";
import type {
  Beneficiary,
  BeneficiaryPage,
  BeneficiaryStatus,
  CreateCustomerBeneficiaryRequest,
  UpdateBeneficiaryRequest,
} from "@/types/beneficiary";

export async function fetchCustomerBeneficiaries(
  page = 0,
  size = 10,
  status?: BeneficiaryStatus
): Promise<BeneficiaryPage> {
  return getCurrentCustomerBeneficiaries(page, size, status);
}

export async function fetchBeneficiaries(
  page = 0,
  size = 10,
  status?: BeneficiaryStatus
): Promise<Beneficiary[]> {
  const res = await getCurrentCustomerBeneficiaries(page, size, status);
  return res.content || [];
}

export async function fetchCustomerBeneficiaryDetails(
  id: string
): Promise<Beneficiary> {
  return getCustomerBeneficiaryById(id);
}

export async function addCustomerBeneficiary(
  request: CreateCustomerBeneficiaryRequest
): Promise<Beneficiary> {
  return createCustomerBeneficiary(request);
}

export async function addBeneficiary(
  request: {
    name: string;
    bankName?: string;
    accountNumber: string;
    ifscCode?: string;
  }
): Promise<Beneficiary> {
  return createCustomerBeneficiary({
    accountId: request.accountNumber,
    beneficiaryName: request.name,
    bankName: request.bankName,
    accountNumber: request.accountNumber,
  });
}

export async function editCustomerBeneficiary(
  id: string,
  request: UpdateBeneficiaryRequest
): Promise<Beneficiary> {
  return updateCustomerBeneficiary(id, request);
}

export async function removeCustomerBeneficiary(
  id: string
): Promise<void> {
  return deleteCustomerBeneficiary(id);
}
