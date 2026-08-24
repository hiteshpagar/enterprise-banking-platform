import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const {
    isAuthenticated,
    requiresCredentialChange,
    isLoading,
    isBankUser,
    isCustomerUser,
  } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated && requiresCredentialChange) {
    return <Redirect href="/(auth)/change-credentials" />;
  }

  if (isAuthenticated && isBankUser) {
    return <Redirect href="/(bank)/dashboard" />;
  }

  if (isAuthenticated && isCustomerUser) {
    return <Redirect href="/(customer)/dashboard" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/access-denied" />;
  }

  return <Redirect href="/(auth)/login" />;
}
