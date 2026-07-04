import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PremiumScreenController } from "../hooks/use-premium-screen-controller";
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
  screenState,
  selectTier,
  state,
  statusState,
}: PremiumScreenViewProps) {
  const theme = useCustomizationTheme();

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-5 px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <View className="gap-2">
        <Text
          className="text-[13px] font-extrabold uppercase"
          style={{ color: theme.accent }}
        >
          {screenState.header.kicker}
        </Text>
        <Text
          className="text-[34px] font-extrabold leading-10"
          style={{ color: theme.primaryText }}
        >
          {screenState.header.title}
        </Text>
        <Text
          className="max-w-[520px] text-[15px] leading-[22px]"
          style={{ color: theme.secondaryText }}
        >
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
        className="text-[15px] font-extrabold"
        href={screenState.backLink.href}
        style={{ color: theme.accent }}
      >
        {screenState.backLink.label}
      </Link>
    </ScrollView>
  );
}
