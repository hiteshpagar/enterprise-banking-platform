import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { BeneficiaryList } from "../../../components/beneficiaries/BeneficiaryList";
import { fetchCustomerBeneficiaries } from "../../../services/beneficiaryService";
import type { Beneficiary, BeneficiaryPage } from "../../../types/beneficiary";

const PAGE_SIZE = 10;

export default function BeneficiariesScreen() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [pageInfo, setPageInfo] = useState<BeneficiaryPage | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadBeneficiaries = useCallback(
    async (page: number, mode: "replace" | "append") => {
      setError("");

      if (mode === "replace") {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await fetchCustomerBeneficiaries(page, PAGE_SIZE);
        setPageInfo(response);
        setBeneficiaries((current) =>
          mode === "append"
            ? [...current, ...response.content]
            : response.content
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load beneficiaries."
        );
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadBeneficiaries(0, "replace");
  }, [loadBeneficiaries]);

  function handleRefresh() {
    setIsRefreshing(true);
    loadBeneficiaries(0, "replace");
  }

  function handleLoadMore() {
    if (!pageInfo || pageInfo.last) {
      return;
    }
    loadBeneficiaries(pageInfo.number + 1, "append");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>

          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>My Beneficiaries</Text>
            <Text style={styles.title}>Beneficiaries</Text>
          </View>

          <Pressable
            onPress={() => router.push("/(customer)/beneficiaries/add" as Href)}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </Pressable>
        </View>

        {pageInfo ? (
          <Text style={styles.resultCount}>
            {pageInfo.totalElements} beneficiar{pageInfo.totalElements === 1 ? "y" : "ies"}
          </Text>
        ) : null}
      </View>

      <BeneficiaryList
        beneficiaries={beneficiaries}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        isRefreshing={isRefreshing}
        error={error}
        canLoadMore={!!pageInfo && !pageInfo.last}
        onBeneficiaryPress={(id) =>
          router.push(`/(customer)/beneficiaries/${id}` as Href)
        }
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        onRetry={() => loadBeneficiaries(0, "replace")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 18,
    backgroundColor: "#FFFFFF",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  backButton: {
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
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    marginTop: 2,
    color: "#111827",
    fontSize: 26,
    fontWeight: "800",
  },
  addButton: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#1D4ED8",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  resultCount: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
  },
});
