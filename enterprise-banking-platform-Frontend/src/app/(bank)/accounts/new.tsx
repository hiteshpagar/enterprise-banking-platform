import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";

import { fetchCustomers } from "../../../services/customerService";
import { openAccount } from "../../../services/accountService";

import type {
  CustomerSummary,
  CustomerPage,
} from "../../../types/customer";

import type {
  AccountType,
  CreateAccountRequest,
} from "../../../types/account";

const ACCOUNT_TYPES: AccountType[] = [
  "SAVINGS",
  "CURRENT",
  "SALARY",
];

export default function CreateAccountScreen() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerSummary | null>(null);

  const [accountType, setAccountType] =
    useState<AccountType>("SAVINGS");

  const [currency, setCurrency] = useState("INR");
  const [openingBalance, setOpeningBalance] = useState("");

  const [isLoadingCustomers, setIsLoadingCustomers] =
    useState(true);

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setIsLoadingCustomers(true);
    setError("");

    try {
      const response: CustomerPage = await fetchCustomers({
        page: 0,
        size: 100,
        sortBy: "firstName",
      });

      setCustomers(response.content);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load customers."
      );
    } finally {
      setIsLoadingCustomers(false);
    }
  }

  async function handleCreateAccount() {
    setError("");
    setSuccess("");

    if (!selectedCustomer) {
      setError("Please select a customer.");
      return;
    }

    if (!currency.trim()) {
      setError("Currency is required.");
      return;
    }

    if (!openingBalance.trim()) {
      setError("Opening balance is required.");
      return;
    }

    const balance = Number(openingBalance);

    if (Number.isNaN(balance) || balance < 0) {
      setError("Opening balance must be a valid non-negative number.");
      return;
    }

    const request: CreateAccountRequest = {
      customerId: selectedCustomer.id,
      accountType,
      currency: currency.trim().toUpperCase(),
      openingBalance: balance,
    };

    setIsCreating(true);

    try {
      const account = await openAccount(request);

      setSuccess(
        `Account ${account.accountNumber} created successfully for ${selectedCustomer.firstName} ${selectedCustomer.lastName}.`
      );

      setOpeningBalance("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create account."
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <Text style={styles.eyebrow}>Bank / Staff</Text>

        <Text style={styles.title}>
          Create Account
        </Text>

        <Text style={styles.subtitle}>
          Open a banking account for an existing customer.
        </Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {success ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{success}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.label}>
          Select Customer
        </Text>

        {isLoadingCustomers ? (
          <View style={styles.loading}>
            <ActivityIndicator />
            <Text style={styles.mutedText}>
              Loading customers...
            </Text>
          </View>
        ) : customers.length === 0 ? (
          <Text style={styles.mutedText}>
            No customers available.
          </Text>
        ) : (
          <View style={styles.customerList}>
            {customers.map((customer) => {
              const isSelected =
                selectedCustomer?.id === customer.id;

              return (
                <Pressable
                  key={customer.id}
                  onPress={() =>
                    setSelectedCustomer(customer)
                  }
                  style={[
                    styles.customerCard,
                    isSelected &&
                      styles.selectedCustomerCard,
                  ]}
                >
                  <Text style={styles.customerName}>
                    {customer.firstName}{" "}
                    {customer.lastName}
                  </Text>

                  <Text style={styles.customerNumber}>
                    Customer No: {customer.customerNumber}
                  </Text>

                  <Text style={styles.customerContact}>
                    {customer.mobileNumber}
                  </Text>

                  <Text style={styles.customerContact}>
                    {customer.email}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>
          Account Type
        </Text>

        <View style={styles.optionRow}>
          {ACCOUNT_TYPES.map((type) => {
            const selected = accountType === type;

            return (
              <Pressable
                key={type}
                onPress={() => setAccountType(type)}
                style={[
                  styles.option,
                  selected && styles.selectedOption,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    selected &&
                      styles.selectedOptionText,
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>
          Currency
        </Text>

        <TextInput
          value={currency}
          onChangeText={setCurrency}
          placeholder="INR"
          autoCapitalize="characters"
          style={styles.input}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>
          Opening Balance
        </Text>

        <TextInput
          value={openingBalance}
          onChangeText={setOpeningBalance}
          placeholder="0.00"
          keyboardType="decimal-pad"
          style={styles.input}
        />
      </View>

      <Pressable
        onPress={handleCreateAccount}
        disabled={isCreating || isLoadingCustomers}
        style={[
          styles.createButton,
          (isCreating || isLoadingCustomers) &&
            styles.disabledButton,
        ]}
      >
        {isCreating ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.createButtonText}>
            Create Account
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 56,
    paddingBottom: 40,
    backgroundColor: "#F5F7FA",
  },

  header: {
    marginBottom: 24,
  },

  backButton: {
    alignSelf: "flex-start",
    marginBottom: 18,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#E5E7EB",
  },

  backButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },

  eyebrow: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  title: {
    marginTop: 4,
    color: "#111827",
    fontSize: 30,
    fontWeight: "800",
  },

  subtitle: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 15,
  },

  section: {
    marginBottom: 22,
    borderRadius: 10,
    padding: 18,
    backgroundColor: "#FFFFFF",
  },

  label: {
    marginBottom: 12,
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
  },

  loading: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 20,
  },

  mutedText: {
    color: "#6B7280",
    fontSize: 14,
  },

  customerList: {
    gap: 10,
  },

  customerCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 14,
  },

  selectedCustomerCard: {
    borderColor: "#1D4ED8",
    borderWidth: 2,
    backgroundColor: "#EFF6FF",
  },

  customerName: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
  },

  customerNumber: {
    marginTop: 4,
    color: "#374151",
    fontSize: 13,
  },

  customerContact: {
    marginTop: 3,
    color: "#6B7280",
    fontSize: 13,
  },

  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  option: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },

  selectedOption: {
    borderColor: "#1D4ED8",
    backgroundColor: "#EFF6FF",
  },

  optionText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "700",
  },

  selectedOptionText: {
    color: "#1D4ED8",
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 14,
    color: "#111827",
    fontSize: 15,
    backgroundColor: "#FFFFFF",
  },

  createButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: "#1D4ED8",
  },

  disabledButton: {
    opacity: 0.6,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  errorBox: {
    marginBottom: 18,
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#FEE2E2",
  },

  errorText: {
    color: "#991B1B",
    fontSize: 14,
  },

  successBox: {
    marginBottom: 18,
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#DCFCE7",
  },

  successText: {
    color: "#166534",
    fontSize: 14,
    fontWeight: "600",
  },
});