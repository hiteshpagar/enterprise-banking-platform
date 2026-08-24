import { StyleSheet, Text, View } from "react-native";
import type { AccountStatus } from "@/types/account";

interface AccountStatusBadgeProps {
  status: AccountStatus;
}

const statusStyles: Record<
  AccountStatus,
  { backgroundColor: string; color: string }
> = {
  ACTIVE: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
  },
  BLOCKED: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
  },
  FROZEN: {
    backgroundColor: "#DBEAFE",
    color: "#1D4ED8",
  },
  CLOSED: {
    backgroundColor: "#E5E7EB",
    color: "#374151",
  },
};

export function AccountStatusBadge({
  status,
}: AccountStatusBadgeProps) {
  const colors = statusStyles[status];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.backgroundColor,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.color,
          },
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});
