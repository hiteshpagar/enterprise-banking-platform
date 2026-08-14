import { apiRequest } from "./client";
import type { CurrentUserResponse } from "../types/auth";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
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
