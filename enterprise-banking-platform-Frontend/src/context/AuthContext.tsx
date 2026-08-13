import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";

import { login as loginApi } from "../api/auth";

const TOKEN_KEY = "access_token";
const TOKEN_TYPE_KEY = "token_type";

interface AuthContextType {
  accessToken: string | null;
  tokenType: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [accessToken, setAccessToken] =
    useState<string | null>(null);

  const [tokenType, setTokenType] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken =
        await SecureStore.getItemAsync(TOKEN_KEY);

      const storedTokenType =
        await SecureStore.getItemAsync(TOKEN_TYPE_KEY);

      if (storedToken) {
        setAccessToken(storedToken);
        setTokenType(storedTokenType ?? "Bearer");
      }
    } catch (error) {
      console.error(
        "Failed to load authentication:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function login(
    username: string,
    password: string
  ) {
    const response = await loginApi({
      username,
      password,
    });

    await SecureStore.setItemAsync(
      TOKEN_KEY,
      response.accessToken
    );

    await SecureStore.setItemAsync(
      TOKEN_TYPE_KEY,
      response.tokenType
    );

    setAccessToken(response.accessToken);
    setTokenType(response.tokenType);
  }

  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(TOKEN_TYPE_KEY);

    setAccessToken(null);
    setTokenType(null);
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        tokenType,
        isAuthenticated: !!accessToken,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}