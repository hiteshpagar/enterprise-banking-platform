export type CustomerStatus = "ACTIVE" | "INACTIVE" | "BLOCKED" | "CLOSED";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface CreateCustomerRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  mobileNumber: string;
  email: string;
  status: CustomerStatus;
}

export interface Customer {
  id: string;
  customerNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  mobileNumber: string;
  email: string;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPage {
  content: CustomerSummary[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface CustomerSummary {
  id: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  status: CustomerStatus;
}