import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

export function BackupScreenHeader() {
  const theme = useCustomizationTheme();

  return (
    <View className="gap-2">
      <Text
        className="text-[13px] font-extrabold uppercase"
        style={{ color: theme.accent }}
      >
        Library Safety
      </Text>
      <Text
        className="text-[34px] font-extrabold leading-10"
        style={{ color: theme.primaryText }}
      >
        Backup & Restore
      </Text>
      <Text
        className="max-w-[520px] text-[15px] leading-[22px]"
        style={{ color: theme.secondaryText }}
      >
        Save a copy of your local library, restore from an archive, or clear
        this device.
      </Text>
    </View>
  );
}
