import { View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportSongDraft } from "../types/import-session";
import { ImportSongPreviewEmptyState } from "./ImportSongPreviewEmptyState";
import { ImportSongPreviewRow } from "./ImportSongPreviewRow";

type ImportSongPreviewListProps = {
  canEditSongs?: boolean;
  onRemoveSong?: (songId: number) => Promise<void> | void;
  songs: ImportSongDraft[];
};

export function ImportSongPreviewList({
  canEditSongs = false,
  onRemoveSong,
  songs,
}: ImportSongPreviewListProps) {
  const theme = useCustomizationTheme();

  if (songs.length === 0) {
    return <ImportSongPreviewEmptyState />;
  }

  return (
    <View
      className="overflow-hidden rounded-lg border"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      {songs.map((song) => (
        <ImportSongPreviewRow
          canEditSongs={canEditSongs}
          key={song.id}
          onRemoveSong={onRemoveSong}
          song={song}
        />
      ))}
    </View>
  );
}
