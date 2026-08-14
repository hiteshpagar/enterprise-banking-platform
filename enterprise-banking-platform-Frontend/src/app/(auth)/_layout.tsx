import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function AuthLayout() {
  const {
    isAuthenticated,
    isLoading,
    isBankUser,
    isCustomerUser,
  } = useAuth();

  if (isLoading) {
    return null;
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

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
