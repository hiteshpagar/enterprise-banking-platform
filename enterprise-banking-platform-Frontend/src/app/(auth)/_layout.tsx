import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function AuthLayout() {
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

  // If user is authenticated and DOES NOT require credential change, send them to their dashboard
  if (isAuthenticated && !requiresCredentialChange) {
    if (isBankUser) {
      return <Redirect href="/(bank)/dashboard" />;
    }

    if (isCustomerUser) {
      return <Redirect href="/(customer)/dashboard" />;
    }

    return <Redirect href="/access-denied" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
