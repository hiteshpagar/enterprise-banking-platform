export type BeneficiaryStatus = "ACTIVE" | "INACTIVE";

export interface Beneficiary {
  id: string;
  customerId: string;
  accountId: string;
  beneficiaryName: string;
  bankName?: string;
  accountNumber: string;
  status: BeneficiaryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BeneficiaryPage {
  content: Beneficiary[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface CreateCustomerBeneficiaryRequest {
  accountId: string;
  beneficiaryName: string;
  bankName?: string;
  accountNumber: string;
}

export interface UpdateBeneficiaryRequest {
  beneficiaryName: string;
  bankName?: string;
  status: BeneficiaryStatus;
}
