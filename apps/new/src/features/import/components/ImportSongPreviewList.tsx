import { View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import {
  getImportSongPreviewListState,
  type ImportSongPreviewEmptyState as ImportSongPreviewEmptyStateConfig,
} from "../services/import-song-preview-state-service";
import type { ImportSongDraft } from "../types/import-session";
import { ImportSongPreviewEmptyState } from "./ImportSongPreviewEmptyState";
import { ImportSongPreviewRow } from "./ImportSongPreviewRow";

type ImportSongPreviewListProps = {
  canEditSongs?: boolean;
  emptyState: ImportSongPreviewEmptyStateConfig;
  onRemoveSong?: (songId: number) => Promise<void> | void;
  songs: ImportSongDraft[];
};

export function ImportSongPreviewList({
  canEditSongs = false,
  emptyState,
  onRemoveSong,
  songs,
}: ImportSongPreviewListProps) {
  const theme = useCustomizationTheme();
  const listState = getImportSongPreviewListState({ songs });

  if (songs.length === 0) {
    return <ImportSongPreviewEmptyState emptyState={emptyState} />;
  }

  return (
    <View
      className="overflow-hidden rounded-lg border"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      {listState.rows.map((row) => (
        <ImportSongPreviewRow
          canEditSongs={canEditSongs}
          key={row.song.id}
          onRemoveSong={onRemoveSong}
          row={row}
        />
      ))}
    </View>
  );
}
