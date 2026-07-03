import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getImportSaveHeaderState } from "../services/import-save-screen-state-service";

export function ImportSaveHeader() {
  const theme = useCustomizationTheme();
  const headerState = getImportSaveHeaderState();

  return (
    <View className="gap-2">
      <Text
        className="text-[13px] font-extrabold uppercase"
        style={{ color: theme.accent }}
      >
        {headerState.kicker}
      </Text>
      <Text
        className="text-[34px] font-extrabold leading-10"
        style={{ color: theme.primaryText }}
      >
        {headerState.title}
      </Text>
      <Text
        className="max-w-[520px] text-[15px] leading-[22px]"
        style={{ color: theme.secondaryText }}
      >
        {headerState.subtitle}
      </Text>
    </View>
  );
}
