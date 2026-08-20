import { StyleSheet, Text, View } from "react-native";

interface TransferStepIndicatorProps {
  currentStep: number; // 1: Account, 2: Beneficiary, 3: Amount, 4: Review, 5: Result
}

const STEPS = [
  { step: 1, label: "Account" },
  { step: 2, label: "Beneficiary" },
  { step: 3, label: "Amount" },
  { step: 4, label: "Review" },
];

export function TransferStepIndicator({ currentStep }: TransferStepIndicatorProps) {
  if (currentStep > 4) {
    return null;
  }

  return (
    <View style={styles.container}>
      {STEPS.map((item, index) => {
        const isActive = currentStep === item.step;
        const isCompleted = currentStep > item.step;

        return (
          <View key={item.step} style={styles.stepWrapper}>
            <View
              style={[
                styles.badge,
                isActive && styles.activeBadge,
                isCompleted && styles.completedBadge,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  (isActive || isCompleted) && styles.activeBadgeText,
                ]}
              >
                {isCompleted ? "✓" : item.step}
              </Text>
            </View>
            <Text
              style={[
                styles.label,
                isActive && styles.activeLabel,
                isCompleted && styles.completedLabel,
              ]}
            >
              {item.label}
            </Text>
            {index < STEPS.length - 1 && (
              <View
                style={[
                  styles.connector,
                  isCompleted && styles.completedConnector,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  stepWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  activeBadge: {
    backgroundColor: "#1D4ED8",
    borderColor: "#1D4ED8",
  },
  completedBadge: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  activeBadgeText: {
    color: "#FFFFFF",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeLabel: {
    color: "#1D4ED8",
    fontWeight: "700",
  },
  completedLabel: {
    color: "#059669",
  },
  connector: {
    width: 14,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 4,
  },
  completedConnector: {
    backgroundColor: "#059669",
  },
});
