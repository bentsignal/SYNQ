import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
  rewriteFeatures,
  rewriteStatusTotals,
} from "../../rewrite-feature-map";
import { RewriteStatusBadge } from "../components/RewriteStatusBadge";

export function RewriteDashboardScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.screen}
      testID="rewrite-dashboard-screen"
    >
      <View style={styles.header}>
        <Text style={styles.kicker}>SYNQ rewrite</Text>
        <Text style={styles.title}>Feature map</Text>
        <View style={styles.totalsRow}>
          <Text style={styles.totalText}>Done {rewriteStatusTotals.done}</Text>
          <Text style={styles.totalText}>
            Active {rewriteStatusTotals.active}
          </Text>
          <Text style={styles.totalText}>
            Pending {rewriteStatusTotals.pending}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {rewriteFeatures.map((feature) => (
          <View key={feature.key} style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <Text style={styles.featureName}>{feature.name}</Text>
              <RewriteStatusBadge status={feature.status} />
            </View>
            <Text style={styles.meta}>{feature.targetBoundary}</Text>
            <Text style={styles.body}>{feature.nextMilestone}</Text>
            <Text style={styles.reference}>{feature.oldReference}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#f4f7f5",
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  header: {
    gap: 10,
    marginBottom: 24,
  },
  kicker: {
    color: "#0f766e",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#121417",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 42,
  },
  totalsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  totalText: {
    color: "#34403b",
    fontSize: 13,
    fontWeight: "700",
  },
  grid: {
    gap: 12,
  },
  featureCard: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  featureHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  featureName: {
    color: "#121417",
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 23,
  },
  meta: {
    color: "#52605a",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  body: {
    color: "#29322e",
    fontSize: 14,
    lineHeight: 20,
  },
  reference: {
    color: "#6f7a75",
    fontSize: 12,
    lineHeight: 17,
  },
});
