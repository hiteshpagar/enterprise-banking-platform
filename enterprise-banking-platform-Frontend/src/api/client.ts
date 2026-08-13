const API_BASE_URL = "http://192.168.110.19:8080/api";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
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

  return response.json();
}