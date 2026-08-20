import { StyleSheet, Text, View } from "react-native";
import type { BeneficiaryStatus } from "../../types/beneficiary";

interface BeneficiaryStatusBadgeProps {
  status: BeneficiaryStatus;
}

export function BeneficiaryStatusBadge({ status }: BeneficiaryStatusBadgeProps) {
  const isActive = status === "ACTIVE";

  return (
    <View style={[styles.badge, isActive ? styles.activeBadge : styles.inactiveBadge]}>
      <Text style={[styles.text, isActive ? styles.activeText : styles.inactiveText]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeBadge: {
    backgroundColor: "#ECFDF5",
  },
  inactiveBadge: {
    backgroundColor: "#FEF2F2",
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  activeText: {
    color: "#065F46",
  },
  inactiveText: {
    color: "#991B1B",
  },
});
