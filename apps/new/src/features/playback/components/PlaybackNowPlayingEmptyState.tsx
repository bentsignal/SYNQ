import { Text } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type PlaybackNowPlayingEmptyStateProps = {
  theme: CustomizationTheme;
};

export function PlaybackNowPlayingEmptyState({
  theme,
}: PlaybackNowPlayingEmptyStateProps) {
  return (
    <>
      <Text
        className="text-[28px] font-extrabold leading-[34px]"
        style={{ color: theme.primaryText }}
      >
        Nothing selected
      </Text>
      <Text
        className="text-[15px] leading-[22px]"
        style={{ color: theme.secondaryText }}
      >
        Open a song in Library and start a playback session.
      </Text>
    </>
  );
}
