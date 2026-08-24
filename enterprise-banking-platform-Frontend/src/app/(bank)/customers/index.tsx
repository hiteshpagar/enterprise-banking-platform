import React, { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { router, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchCustomers } from "@/services/customerService";
import type { CustomerSummary } from "@/types/customer";
import { Colors } from "@/constants/theme";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { BottomNavBar } from "@/components/common/BottomNavBar";

export default function BankCustomersScreen() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchCustomers({ page: 0, size: 50 });
      setCustomers(res.content || []);
      setTotalElements(res.totalElements || res.content?.length || 0);
    } catch (err) {
      console.error("Customers list load error", err);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeCount = customers.filter(c => c.status === "ACTIVE").length;

  const filtered = customers.filter(item => {
    const fullName = `${item.firstName} ${item.lastName}`;
    return (
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      item.customerNumber?.toLowerCase().includes(search.toLowerCase()) ||
      item.mobileNumber?.includes(search)
    );
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Customers" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainWrapper}>
          {/* Search bar */}
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name, mobile or customer ID"
              style={styles.searchInput}
            />
          </View>

          {/* Counts pill bar */}
          <View style={styles.countSummaryCard}>
            <View style={styles.countItem}>
              <Text style={styles.countLabel}>Total Customers</Text>
              <Text style={styles.countValue}>{totalElements}</Text>
            </View>
            <View style={styles.dividerVertical} />
            <View style={styles.countItem}>
              <Text style={styles.countLabel}>Active</Text>
              <Text style={[styles.countValue, { color: Colors.actionBlue }]}>{activeCount}</Text>
            </View>
          </View>

          {/* Customers list */}
          {isLoading ? (
            <ActivityIndicator color={Colors.actionBlue} size="large" style={{ marginVertical: 30 }} />
          ) : filtered.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="people-outline" size={40} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>No customers found</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {filtered.map((item) => {
                const fullName = `${item.firstName} ${item.lastName}`.trim() || item.customerNumber;
                const initials = fullName.length >= 2 ? fullName.slice(0, 2).toUpperCase() : "C";
                const isActive = item.status === "ACTIVE";
                return (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [styles.customerCard, pressed && styles.pressed]}
                    onPress={() => router.push(`/(bank)/customers/${item.id}` as Href)}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <View style={styles.info}>
                      <Text style={styles.name}>{fullName}</Text>
                      <Text style={styles.subText}>{item.customerNumber} • {item.mobileNumber || item.email || ""}</Text>
                    </View>
                    <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.inactiveBadge]}>
                      <Text style={[styles.statusText, isActive ? styles.activeText : styles.inactiveText]}>
                        {item.status || "ACTIVE"}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Add New Customer Fixed Button */}
          <Pressable
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            onPress={() => router.push("/(bank)/customers/new" as Href)}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add New Customer</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomNavBar type="bank" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  mainWrapper: {
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  countSummaryCard: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  countItem: {
    flex: 1,
    alignItems: "center",
  },
  countLabel: {
    fontSize: 12,
    color: "#D5E3FF",
    fontWeight: "600",
  },
  countValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 2,
  },
  dividerVertical: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  list: {
    gap: 12,
    marginBottom: 20,
  },
  customerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pressed: {
    opacity: 0.9,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  subText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activeBadge: {
    backgroundColor: "#DCFCE7",
  },
  inactiveBadge: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  activeText: {
    color: Colors.success,
  },
  inactiveText: {
    color: Colors.danger,
  },
  emptyCard: {
    padding: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.actionBlue,
    marginTop: 8,
  },
  addBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
