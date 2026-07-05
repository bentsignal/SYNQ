import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type {
  PlaybackPlayerHeaderState,
} from "../services/playback-screen-state-service";

type PlaybackPlayerHeaderProps = {
  header: PlaybackPlayerHeaderState;
};

export function PlaybackPlayerHeader({ header }: PlaybackPlayerHeaderProps) {
  const theme = useCustomizationTheme();

  return (
    <View className="gap-2">
      <Text
        className="text-[13px] font-extrabold uppercase"
        style={{ color: theme.accent }}
      >
        {header.kicker}
      </Text>
      <Text
        className="text-[34px] font-extrabold leading-10"
        style={{ color: theme.primaryText }}
      >
        {header.title}
      </Text>
      <Text
        className="max-w-[520px] text-[15px] leading-[22px]"
        style={{ color: theme.secondaryText }}
      >
        {header.subtitle}
      </Text>
    </View>
  );
}
