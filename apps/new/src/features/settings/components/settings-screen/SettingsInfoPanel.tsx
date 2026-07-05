import { Text, View } from "react-native";
import type { CustomizationTheme } from "../../hooks/use-customization-theme";
import type { SettingsInfoPanelState } from "./SettingsScreenTypes";

export function SettingsInfoPanel({
  panel,
  theme,
}: {
  panel: SettingsInfoPanelState;
  theme: CustomizationTheme;
}) {
  return (
    <View
      className="gap-2 rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className="text-base font-extrabold leading-[22px]"
        style={{ color: theme.primaryText }}
      >
        {panel.title}
      </Text>
      <Text
        className="text-sm leading-5"
        style={{ color: theme.secondaryText }}
      >
        {panel.body}
      </Text>
    </View>
  );
}

