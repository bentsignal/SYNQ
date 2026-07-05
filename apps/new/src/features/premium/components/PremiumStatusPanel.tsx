import { Pressable, Text, View } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PremiumStatusState } from "../services/premium-status-state-service";

type PremiumStatusPanelProps = {
  onReset: () => void;
  statusState: PremiumStatusState;
  theme: CustomizationTheme;
};

export function PremiumStatusPanel({
  onReset,
  statusState,
  theme,
}: PremiumStatusPanelProps) {
  return (
    <View
      className="gap-2.5 rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className="text-xs font-extrabold uppercase"
        style={{ color: theme.secondaryText }}
      >
        Status
      </Text>
      <Text
        className={`text-sm leading-5 ${
          statusState.isFailure ? "font-bold" : ""
        }`}
        style={{
          color: statusState.isFailure ? theme.danger : theme.primaryText,
        }}
      >
        {statusState.message}
      </Text>
      {statusState.canReset ? (
        <Pressable
          accessibilityRole="button"
          className="min-h-[38px] items-center justify-center rounded-lg border px-3"
          onPress={onReset}
          style={{ borderColor: theme.border }}
        >
          <Text
            className="text-xs font-extrabold uppercase"
            style={{ color: theme.accent }}
          >
            Reset status
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
