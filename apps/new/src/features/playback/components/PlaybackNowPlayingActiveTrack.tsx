import { Image, Text, View } from "react-native";
import { formatDurationMs } from "@/src/features/app-shell/services/duration-format-service";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import { PlaybackProgressBar } from "./PlaybackProgressBar";

type PlaybackNowPlayingActiveTrackProps = {
  activeTrack: PlaybackQueueItem;
  artworkUri: string | null;
  onSeekToPosition: (position: number) => void;
  progressPercent: number;
  state: PlaybackState;
  theme: CustomizationTheme;
};

export function PlaybackNowPlayingActiveTrack({
  activeTrack,
  artworkUri,
  onSeekToPosition,
  progressPercent,
  state,
  theme,
}: PlaybackNowPlayingActiveTrackProps) {
  return (
    <>
      {artworkUri ? (
        <Image
          accessibilityLabel={`${activeTrack.title} artwork`}
          className="h-28 w-28 rounded-lg"
          source={{ uri: artworkUri }}
        />
      ) : (
        <View
          className="h-28 w-28 items-center justify-center rounded-lg"
          style={{ backgroundColor: theme.border }}
        >
          <Text
            className="text-3xl font-extrabold"
            style={{ color: theme.secondaryText }}
          >
            {activeTrack.title.trim().slice(0, 1).toUpperCase() || "S"}
          </Text>
        </View>
      )}
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
      <PlaybackProgressBar
        duration={state.duration}
        onSeek={onSeekToPosition}
        progressPercent={progressPercent}
        theme={theme}
      />
      <Text
        className="text-xs font-extrabold uppercase leading-[17px]"
        style={{ color: theme.secondaryText }}
      >
        {progressPercent}% complete
      </Text>
    </>
  );
}
