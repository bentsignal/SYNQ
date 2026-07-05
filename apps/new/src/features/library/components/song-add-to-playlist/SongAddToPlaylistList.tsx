import { Text, View } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionListState } from "../../services/library-collection-list-service";
import type { SongAddToPlaylistRowState } from "../../services/song-add-to-playlist-row-state-service";
import { SongAddToPlaylistRow } from "../SongAddToPlaylistRow";

type SongAddToPlaylistListProps = {
  addToPlaylist: (playlistId: number) => void;
  listState: LibraryCollectionListState;
  rowStates: SongAddToPlaylistRowState[];
  theme: CustomizationTheme;
};

export function SongAddToPlaylistList({
  addToPlaylist,
  listState,
  rowStates,
  theme,
}: SongAddToPlaylistListProps) {
  return (
    <View
      className="overflow-hidden rounded-lg border"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      {listState.visibleCollections.length === 0 ? (
        <Text
          className="p-3.5 text-sm italic leading-5"
          style={{ color: theme.mutedText }}
        >
          {listState.emptyLabel}
        </Text>
      ) : (
        rowStates.map((rowState) => (
          <SongAddToPlaylistRow
            addToPlaylist={addToPlaylist}
            key={rowState.playlist.id}
            rowState={rowState}
            theme={theme}
          />
        ))
      )}
    </View>
  );
}

