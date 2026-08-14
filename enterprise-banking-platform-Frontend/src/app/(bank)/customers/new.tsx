import { useState } from "react";
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
import { AccessDenied } from "../../../components/auth/AccessDenied";
import { useAuth } from "../../../context/AuthContext";
import { onboardCustomer } from "../../../services/customerService";
import type {
  CustomerStatus,
  Gender,
} from "../../../types/customer";

const genderOptions: Gender[] = ["MALE", "FEMALE", "OTHER"];
const statusOptions: CustomerStatus[] = ["ACTIVE", "INACTIVE", "BLOCKED"];

export default function CreateCustomerScreen() {
  const { hasPermission } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<Gender>("MALE");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<CustomerStatus>("ACTIVE");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!hasPermission("CUSTOMER_CREATE")) {
    return <AccessDenied />;
  }

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    if (!dateOfBirth.trim()) {
      setError("Date of birth is required.");
      return;
    }

    if (!/^[0-9]{10}$/.test(mobileNumber.trim())) {
      setError("Mobile number must be 10 digits.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setIsSubmitting(true);

      const customer = await onboardCustomer({
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth.trim(),
        gender,
        mobileNumber: mobileNumber.trim(),
        email: email.trim(),
        status,
      });

      setSuccess(
        `Customer ${customer.customerNumber} created. Login credentials were sent by email.`
      );
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setDateOfBirth("");
      setGender("MALE");
      setMobileNumber("");
      setEmail("");
      setStatus("ACTIVE");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create customer."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <Text style={styles.eyebrow}>Customer Management</Text>
        <Text style={styles.title}>Create Customer</Text>
      </View>

      <View style={styles.form}>
        <Field
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          editable={!isSubmitting}
        />
        <Field
          label="Middle Name"
          value={middleName}
          onChangeText={setMiddleName}
          editable={!isSubmitting}
        />
        <Field
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          editable={!isSubmitting}
        />
        <Field
          label="Date of Birth"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="YYYY-MM-DD"
          editable={!isSubmitting}
        />

        <OptionGroup
          label="Gender"
          options={genderOptions}
          value={gender}
          onChange={setGender}
          disabled={isSubmitting}
        />

        <Field
          label="Mobile Number"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          keyboardType="number-pad"
          placeholder="10 digits"
          editable={!isSubmitting}
        />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isSubmitting}
        />

        <OptionGroup
          label="Status"
          options={statusOptions}
          value={status}
          onChange={setStatus}
          disabled={isSubmitting}
        />

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

        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.submitButtonText}>Create Customer</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  keyboardType?: "default" | "email-address" | "number-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  editable,
  keyboardType = "default",
  autoCapitalize = "words",
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        editable={editable}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        style={styles.input}
      />
    </View>
  );
}

interface OptionGroupProps<T extends string> {
  label: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: OptionGroupProps<T>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionRow}>
        {options.map((option) => (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            disabled={disabled}
            style={[
              styles.optionButton,
              value === option && styles.optionButtonSelected,
            ]}
          >
            <Text
              style={[
                styles.optionButtonText,
                value === option && styles.optionButtonTextSelected,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    gap: 20,
    padding: 24,
    paddingTop: 64,
  },
  header: {
    gap: 6,
  },
  backButton: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#EEF2F7",
  },
  backButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },
  eyebrow: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "800",
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 14,
    color: "#111827",
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  optionButtonSelected: {
    borderColor: "#111827",
    backgroundColor: "#111827",
  },
  optionButtonText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "800",
  },
  optionButtonTextSelected: {
    color: "#FFFFFF",
  },
  errorBox: {
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FEE2E2",
  },
  errorText: {
    color: "#991B1B",
    fontSize: 14,
    fontWeight: "600",
  },
  successBox: {
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#DCFCE7",
  },
  successText: {
    color: "#166534",
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#111827",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
