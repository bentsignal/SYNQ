import { View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { AddableCollectionSong } from "../hooks/use-addable-collection-songs-query";
import { AddableSongEmptyState } from "./AddableSongEmptyState";
import { AddableSongRow } from "./AddableSongRow";

type AddableSongListProps = {
  onAddSong: (songId: number) => void;
  onToggleSongSelection: (songId: number) => void;
  selectedSongIds: Set<number>;
  savingSongId: number | null;
  songs: AddableCollectionSong[];
};

export function AddableSongList({
  onAddSong,
  onToggleSongSelection,
  selectedSongIds,
  savingSongId,
  songs,
}: AddableSongListProps) {
  const theme = useCustomizationTheme();

  if (songs.length === 0) {
    return <AddableSongEmptyState />;
  }

  return (
    <View
      className="overflow-hidden rounded-lg border"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      {songs.map((song) => (
        <AddableSongRow
          key={song.id}
          onAddSong={onAddSong}
          onToggleSongSelection={onToggleSongSelection}
          savingSongId={savingSongId}
          selectedSongIds={selectedSongIds}
          song={song}
        />
      ))}
    </View>
  );
}
