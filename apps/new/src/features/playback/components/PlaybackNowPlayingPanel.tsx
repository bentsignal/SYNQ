import { Text, View } from "react-native";
import { formatDurationMs } from "@/src/features/app-shell/services/duration-format-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";

type PlaybackNowPlayingPanelProps = {
  activeTrack: PlaybackQueueItem | null;
  progressPercent: number;
  state: PlaybackState;
};

export function PlaybackNowPlayingPanel({
  activeTrack,
  progressPercent,
  state,
}: PlaybackNowPlayingPanelProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      className="min-h-[180px] gap-2 rounded-lg border p-[18px]"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className="text-xs font-extrabold uppercase"
        style={{ color: theme.secondaryText }}
      >
        Now playing
      </Text>
      {activeTrack ? (
        <>
          <Text
            className="text-[28px] font-extrabold leading-[34px]"
            numberOfLines={2}
            style={{ color: theme.primaryText }}
          >
            {activeTrack.title}
          </Text>
          <Text
            className="text-[15px] leading-[22px]"
            numberOfLines={1}
            style={{ color: theme.secondaryText }}
          >
            {activeTrack.artist} / {activeTrack.album}
          </Text>
          <Text
            className="text-lg font-extrabold leading-6"
            style={{ color: theme.primaryText }}
          >
            {formatDurationMs(state.position)} / {formatDurationMs(state.duration)}
          </Text>
          <View
            className="h-2 overflow-hidden rounded-full"
            style={{ backgroundColor: theme.border }}
          >
            <View
              className="h-full rounded-full"
              style={{ backgroundColor: theme.accent, width: `${progressPercent}%` }}
            />
          </View>
          <Text
            className="text-xs font-extrabold uppercase leading-[17px]"
            style={{ color: theme.secondaryText }}
          >
            {progressPercent}% complete
          </Text>
        </>
      ) : (
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
      )}
    </View>
  );
}
