import { View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { AddableSongRowModel } from "../services/add-collection-songs-row-state-service";
import { AddableSongEmptyState } from "./AddableSongEmptyState";
import { AddableSongRow } from "./AddableSongRow";

type AddableSongListProps = {
  onAddSong: (songId: number) => void;
  onToggleSongSelection: (songId: number) => void;
  rows: AddableSongRowModel[];
};

export function AddableSongList({
  onAddSong,
  onToggleSongSelection,
  rows,
}: AddableSongListProps) {
  const theme = useCustomizationTheme();

  if (rows.length === 0) {
    return <AddableSongEmptyState />;
  }

  return (
    <View
      className="overflow-hidden rounded-lg border"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      {rows.map(({ rowState, song }) => (
        <AddableSongRow
          key={song.id}
          onAddSong={onAddSong}
          onToggleSongSelection={onToggleSongSelection}
          rowState={rowState}
          song={song}
        />
      ))}
    </View>
  );
}
