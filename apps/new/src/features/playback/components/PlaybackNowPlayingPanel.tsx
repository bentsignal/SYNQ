import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import { PlaybackNowPlayingActiveTrack } from "./PlaybackNowPlayingActiveTrack";
import { PlaybackNowPlayingEmptyState } from "./PlaybackNowPlayingEmptyState";

type PlaybackNowPlayingPanelProps = {
  activeArtworkUri: string | null;
  activeTrack: PlaybackQueueItem | null;
  onSeekToPosition: (position: number) => void;
  progressPercent: number;
  state: PlaybackState;
};

export function PlaybackNowPlayingPanel({
  activeArtworkUri,
  activeTrack,
  onSeekToPosition,
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
        <PlaybackNowPlayingActiveTrack
          artworkUri={activeArtworkUri}
          activeTrack={activeTrack}
          onSeekToPosition={onSeekToPosition}
          progressPercent={progressPercent}
          state={state}
          theme={theme}
        />
      ) : (
        <PlaybackNowPlayingEmptyState theme={theme} />
      )}
    </View>
  );
}
