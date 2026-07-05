import { View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type {
  getPlaybackQueueScreenState,
  getPlaybackQueueViewState,
} from "../services/playback-screen-state-service";
import type { PlaybackQueueItem } from "../types/playback-state";
import { PlaybackQueueEmptyState } from "./PlaybackQueueEmptyState";
import { PlaybackQueueRow } from "./PlaybackQueueRow";

type PlaybackQueueEmptyStateModel = ReturnType<
  typeof getPlaybackQueueScreenState
>["emptyState"];

type PlaybackQueueRowModel = ReturnType<
  typeof getPlaybackQueueViewState
>["rows"][number];

type PlaybackQueueListProps = {
  emptyState: PlaybackQueueEmptyStateModel;
  onMoveSong: (songId: number, direction: "down" | "up") => void;
  onPlaySong: (song: PlaybackQueueItem) => void;
  onRemoveSong: (songId: number) => void;
  rows: PlaybackQueueRowModel[];
};

export function PlaybackQueueList({
  emptyState,
  onMoveSong,
  onPlaySong,
  onRemoveSong,
  rows,
}: PlaybackQueueListProps) {
  const theme = useCustomizationTheme();

  if (rows.length === 0) {
    return <PlaybackQueueEmptyState emptyState={emptyState} />;
  }

  return (
    <View
      className="overflow-hidden rounded-lg border"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      {rows.map(({ rowState, song }) => (
        <PlaybackQueueRow
          key={song.id}
          onMoveSong={onMoveSong}
          onPlaySong={onPlaySong}
          onRemoveSong={onRemoveSong}
          rowState={rowState}
          song={song}
        />
      ))}
    </View>
  );
}
