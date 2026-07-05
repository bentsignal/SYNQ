import { View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import {
  type ImportSongPreviewEmptyState as ImportSongPreviewEmptyStateConfig,
  type ImportSongPreviewRowState,
} from "../services/import-song-preview-state-service";
import { ImportSongPreviewEmptyState } from "./ImportSongPreviewEmptyState";
import { ImportSongPreviewRow } from "./ImportSongPreviewRow";

type ImportSongPreviewListProps = {
  canEditSongs?: boolean;
  emptyState: ImportSongPreviewEmptyStateConfig;
  onRemoveSong?: (songId: number) => Promise<void> | void;
  rows: ImportSongPreviewRowState[];
};

export function ImportSongPreviewList({
  canEditSongs = false,
  emptyState,
  onRemoveSong,
  rows,
}: ImportSongPreviewListProps) {
  const theme = useCustomizationTheme();

  if (rows.length === 0) {
    return <ImportSongPreviewEmptyState emptyState={emptyState} />;
  }

  return (
    <View
      className="overflow-hidden rounded-lg border"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      {rows.map((row) => (
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
