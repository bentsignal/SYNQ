import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

export function HomeHero() {
  const theme = useCustomizationTheme();

  return (
    <View className="gap-2">
      <Text
        className="text-[13px] font-extrabold uppercase"
        style={{ color: theme.accent }}
      >
        SYNQ
      </Text>
      <Text
        className="max-w-[520px] text-[34px] font-extrabold leading-10"
        style={{ color: theme.primaryText }}
      >
        Your music, ready when you are.
      </Text>
      <Text
        className="max-w-[520px] text-[15px] leading-[22px]"
        style={{ color: theme.secondaryText }}
      >
        Import tracks, shape your library, and keep playback moving from one
        place.
      </Text>
    </View>
  );
}
