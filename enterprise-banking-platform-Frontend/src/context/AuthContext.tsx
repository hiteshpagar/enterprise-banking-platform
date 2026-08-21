import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";

import {
  getCurrentUser,
  login as loginApi,
} from "../api/auth";
import type { AuthUser, JwtPayload } from "../types/auth";

const TOKEN_KEY = "access_token";
const TOKEN_TYPE_KEY = "token_type";
const CUSTOMER_ROLE = "CUSTOMER";
const BANK_STAFF_ROLES = ["SUPER_ADMIN"];
const BANK_STAFF_PERMISSIONS = [
  "USER_CREATE",
  "USER_VIEW",
  "USER_UPDATE",
  "USER_DELETE",
  "CUSTOMER_CREATE",
  "CUSTOMER_VIEW",
  "CUSTOMER_UPDATE",
  "CUSTOMER_DELETE",
  "ACCOUNT_CREATE",
  "ACCOUNT_VIEW",
  "ACCOUNT_UPDATE",
  "ACCOUNT_DELETE",
  "TRANSACTION_DEPOSIT",
  "TRANSACTION_WITHDRAW",
  "TRANSACTION_VIEW",
  "TRANSFER_CREATE",
  "TRANSFER_VIEW",
  "BENEFICIARY_CREATE",
  "BENEFICIARY_VIEW",
  "BENEFICIARY_UPDATE",
  "BENEFICIARY_DELETE",
];

interface AuthContextType {
  accessToken: string | null;
  tokenType: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  requiresCredentialChange: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  isCustomerUser: boolean;
  isBankUser: boolean;
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

  const [user, setUser] = useState<AuthUser | null>(null);

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
        if (isJwtExpired(storedToken)) {
          await clearStoredAuth();
          return;
        }

        setAccessToken(storedToken);
        setTokenType(storedTokenType ?? "Bearer");

        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error(
        "Failed to load authentication:",
        error
      );
      await clearStoredAuth();
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

    try {
      const currentUser = await getCurrentUser();

      setAccessToken(response.accessToken);
      setTokenType(response.tokenType);
      setUser(currentUser);
    } catch (error) {
      await clearStoredAuth();
      throw error;
    }
  }

  async function logout() {
    await clearStoredAuth();
  }

  async function clearStoredAuth() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(TOKEN_TYPE_KEY);

    setAccessToken(null);
    setTokenType(null);
    setUser(null);
  }

  function hasRole(role: string) {
    return user?.roles.includes(role) ?? false;
  }

  function hasAnyRole(roles: string[]) {
    return roles.some((role) => hasRole(role));
  }

  function hasPermission(permission: string) {
    return user?.permissions.includes(permission) ?? false;
  }

  function hasAnyPermission(permissions: string[]) {
    return permissions.some((permission) =>
      hasPermission(permission)
    );
  }

  const isCustomerUser = hasRole(CUSTOMER_ROLE);
  const isBankUser =
    hasAnyRole(BANK_STAFF_ROLES) ||
    hasAnyPermission(BANK_STAFF_PERMISSIONS);
  const requiresCredentialChange =
    user?.requiresCredentialChange ?? false;

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        tokenType,
        user,
        isAuthenticated: !!accessToken && !!user,
        requiresCredentialChange,
        isLoading,
        login,
        logout,
        hasRole,
        hasAnyRole,
        hasPermission,
        hasAnyPermission,
        isCustomerUser,
        isBankUser,
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

function isJwtExpired(token: string) {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const [, payload] = token.split(".");

  if (!payload || typeof globalThis.atob !== "function") {
    return null;
  }

  try {
    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");

    const decodedPayload = globalThis.atob(normalizedPayload);
    const parsedPayload: unknown = JSON.parse(decodedPayload);

    if (
      typeof parsedPayload === "object" &&
      parsedPayload !== null
    ) {
      const claims = parsedPayload as Record<string, unknown>;

      return {
        exp:
          typeof claims.exp === "number"
            ? claims.exp
            : undefined,
        sub:
          typeof claims.sub === "string"
            ? claims.sub
            : undefined,
      };
    }
  } catch {
    return null;
  }

  return null;
}
