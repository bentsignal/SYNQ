import { Text, View } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type ImportResultPanelProps = {
  panelHint?: string;
  panelLabel: string;
  panelText: string;
  theme: CustomizationTheme;
};

export function ImportResultPanel({
  panelHint,
  panelLabel,
  panelText,
  theme,
}: ImportResultPanelProps) {
  return (
    <View
      className="gap-2 rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className="text-xs font-extrabold uppercase"
        style={{ color: theme.secondaryText }}
      >
        {panelLabel}
      </Text>
      <Text className="text-sm leading-5" style={{ color: theme.primaryText }}>
        {panelText}
      </Text>
      {panelHint ? (
        <Text
          className="text-xs leading-[17px]"
          style={{ color: theme.mutedText }}
        >
          {panelHint}
        </Text>
      ) : null}
    </View>
  );
}
