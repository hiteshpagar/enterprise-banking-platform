import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function BankLayout() {
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

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (requiresCredentialChange) {
    return <Redirect href="/(auth)/change-credentials" />;
  }

  if (!isBankUser) {
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
