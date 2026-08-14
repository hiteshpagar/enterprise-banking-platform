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
