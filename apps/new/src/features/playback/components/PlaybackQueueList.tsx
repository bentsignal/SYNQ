import { View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PlaybackQueueItem } from "../types/playback-state";
import { PlaybackQueueEmptyState } from "./PlaybackQueueEmptyState";
import { PlaybackQueueRow } from "./PlaybackQueueRow";

type PlaybackQueueListProps = {
  activeTrackId: number | null;
  adBreakActive: boolean;
  onMoveSong: (songId: number, direction: "down" | "up") => void;
  onPlaySong: (song: PlaybackQueueItem) => void;
  onRemoveSong: (songId: number) => void;
  songs: PlaybackQueueItem[];
};

export function PlaybackQueueList({
  activeTrackId,
  adBreakActive,
  onMoveSong,
  onPlaySong,
  onRemoveSong,
  songs,
}: PlaybackQueueListProps) {
  const theme = useCustomizationTheme();

  if (songs.length === 0) {
    return <PlaybackQueueEmptyState />;
  }

  return (
    <View
      className="overflow-hidden rounded-lg border"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      {songs.map((song, index) => (
        <PlaybackQueueRow
          activeTrackId={activeTrackId}
          adBreakActive={adBreakActive}
          index={index}
          key={song.id}
          onMoveSong={onMoveSong}
          onPlaySong={onPlaySong}
          onRemoveSong={onRemoveSong}
          queueLength={songs.length}
          song={song}
        />
      ))}
    </View>
  );
}
