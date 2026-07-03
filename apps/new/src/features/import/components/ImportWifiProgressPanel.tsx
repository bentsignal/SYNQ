import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type ImportWifiProgressPanelProps = {
  progressLabel: string;
};

export function ImportWifiProgressPanel({
  progressLabel,
}: ImportWifiProgressPanelProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      className="flex-row items-center justify-between gap-3 rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className="text-xs font-extrabold uppercase"
        style={{ color: theme.secondaryText }}
      >
        Progress
      </Text>
      <Text
        className="text-base font-extrabold"
        style={{ color: theme.primaryText }}
      >
        {progressLabel}
      </Text>
    </View>
  );
}
