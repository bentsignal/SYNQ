import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PremiumScreenController } from "../hooks/use-premium-screen-controller";
import { getPremiumScreenState } from "../services/premium-screen-service";
import { PremiumActionRow } from "./PremiumActionRow";
import { PremiumFeatureList } from "./PremiumFeatureList";
import { PremiumStatusPanel } from "./PremiumStatusPanel";
import { PremiumTierList } from "./PremiumTierList";

type PremiumScreenViewProps = PremiumScreenController;

export function PremiumScreenView({
  actionState,
  premiumTiers,
  purchase,
  reset,
  restore,
  selectTier,
  state,
  statusState,
}: PremiumScreenViewProps) {
  const theme = useCustomizationTheme();
  const screenState = getPremiumScreenState();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          {screenState.header.kicker}
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          {screenState.header.title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          {screenState.header.subtitle}
        </Text>
      </View>

      <PremiumFeatureList theme={theme} />

      <PremiumTierList
        onSelectTier={selectTier}
        selectedTierId={state.selectedTierId}
        theme={theme}
        tiers={premiumTiers}
      />

      <PremiumActionRow
        actionState={actionState}
        onPurchase={purchase}
        onRestore={restore}
        theme={theme}
      />

      <PremiumStatusPanel
        onReset={reset}
        statusState={statusState}
        theme={theme}
      />

      <Link
        href={screenState.backLink.href}
        style={[styles.backLink, { color: theme.accent }]}
      >
        {screenState.backLink.label}
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  header: {
    gap: 8,
  },
  kicker: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
