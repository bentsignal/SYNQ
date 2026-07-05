import { Pressable, Text, View } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PremiumActionState } from "../services/premium-action-state-service";

type PremiumActionRowProps = {
  actionState: PremiumActionState;
  onPurchase: () => void;
  onRestore: () => void;
  theme: CustomizationTheme;
};

export function PremiumActionRow({
  actionState,
  onPurchase,
  onRestore,
  theme,
}: PremiumActionRowProps) {
  return (
    <View className="flex-row flex-wrap gap-3">
      <Pressable
        accessibilityRole="button"
        className="min-h-[46px] min-w-40 flex-grow items-center justify-center rounded-lg px-3.5"
        disabled={!actionState.canPurchase}
        onPress={onPurchase}
        style={[
          { backgroundColor: theme.accent },
          !actionState.canPurchase ? { opacity: 0.5 } : null,
        ]}
      >
        <Text
          className="text-[13px] font-extrabold uppercase"
          style={{ color: theme.onAccent }}
        >
          {actionState.purchaseLabel}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        className="min-h-[46px] min-w-[110px] flex-grow items-center justify-center rounded-lg border px-3.5"
        disabled={!actionState.canRestore}
        onPress={onRestore}
        style={[
          { backgroundColor: theme.surface, borderColor: theme.border },
          !actionState.canRestore ? { opacity: 0.5 } : null,
        ]}
      >
        <Text
          className="text-[13px] font-extrabold uppercase"
          style={{ color: theme.accent }}
        >
          Restore
        </Text>
      </Pressable>
    </View>
  );
}
