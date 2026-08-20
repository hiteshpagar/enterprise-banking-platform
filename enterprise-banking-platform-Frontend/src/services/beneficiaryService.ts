import {
  getCurrentCustomerBeneficiaries,
  createCustomerBeneficiary,
  getCustomerBeneficiaryById,
  updateCustomerBeneficiary,
  deleteCustomerBeneficiary,
} from "../api/beneficiaries";
import type {
  Beneficiary,
  BeneficiaryPage,
  CreateCustomerBeneficiaryRequest,
  UpdateBeneficiaryRequest,
} from "../types/beneficiary";

export async function fetchCustomerBeneficiaries(
  page = 0,
  size = 10
): Promise<BeneficiaryPage> {
  return getCurrentCustomerBeneficiaries(page, size);
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
