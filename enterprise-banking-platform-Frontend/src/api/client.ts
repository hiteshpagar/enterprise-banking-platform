import * as SecureStore from "expo-secure-store";

const API_BASE_URL = "http://192.168.110.19:8080/api";
const TOKEN_KEY = "access_token";
const TOKEN_TYPE_KEY = "token_type";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (requiresAuth) {
    const accessToken = await SecureStore.getItemAsync(TOKEN_KEY);
    const tokenType =
      (await SecureStore.getItemAsync(TOKEN_TYPE_KEY)) ?? "Bearer";

    if (accessToken) {
      headers.Authorization = `${tokenType} ${accessToken}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch {
      // Ignore invalid/empty error response
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
