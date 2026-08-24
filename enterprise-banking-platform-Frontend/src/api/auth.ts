import { apiRequest } from "./client";
import type { CurrentUserResponse } from "@/types/auth";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  requiresCredentialChange: boolean;
}

export interface ChangeCredentialsRequest {
  newUsername: string;
  newPassword: string;
  confirmPassword: string;
}

export async function login(
  credentials: LoginRequest
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  return apiRequest<CurrentUserResponse>(
    "/auth/me",
    {
      method: "GET",
    },
    true
  );
}

export async function changeCredentials(
  data: ChangeCredentialsRequest
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    "/auth/change-credentials",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    true
  );
}
