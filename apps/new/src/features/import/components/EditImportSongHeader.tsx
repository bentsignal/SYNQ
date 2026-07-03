import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

export function EditImportSongHeader() {
  const theme = useCustomizationTheme();

  return (
    <View className="gap-2">
      <Text className="text-[13px] font-extrabold uppercase" style={{ color: theme.accent }}>
        Import edit
      </Text>
      <Text
        className="text-[34px] font-extrabold leading-10"
        style={{ color: theme.primaryText }}
      >
        Edit song
      </Text>
      <Text
        className="max-w-[520px] text-[15px] leading-[22px]"
        style={{ color: theme.secondaryText }}
      >
        Update staged metadata before writing this song to the library.
      </Text>
    </View>
  );
}
