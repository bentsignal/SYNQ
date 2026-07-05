import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { getPlaybackQueueScreenState } from "../services/playback-screen-state-service";

type PlaybackQueueEmptyStateModel = ReturnType<
  typeof getPlaybackQueueScreenState
>["emptyState"];

type PlaybackQueueEmptyStateProps = {
  emptyState: PlaybackQueueEmptyStateModel;
};

export function PlaybackQueueEmptyState({
  emptyState,
}: PlaybackQueueEmptyStateProps) {
  const theme = useCustomizationTheme();
  return (
    <View
      className="gap-2 rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className="text-base font-extrabold leading-[21px]"
        style={{ color: theme.primaryText }}
      >
        {emptyState.title}
      </Text>
      <Text
        className="text-sm leading-5"
        style={{ color: theme.secondaryText }}
      >
        {emptyState.body}
      </Text>
    </View>
  );
}
