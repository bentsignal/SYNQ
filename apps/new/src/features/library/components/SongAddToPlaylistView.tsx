import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionListState } from "../services/library-collection-list-service";
import {
  getSongAddToPlaylistCopy,
  type SongAddToPlaylistMutationState,
} from "../services/song-add-to-playlist-service";
import { LibraryCollectionListSearch } from "./LibraryCollectionListSearch";
import {
  SongAddToPlaylistHeader,
  SongAddToPlaylistList,
  SongAddToPlaylistStatus,
} from "./SongAddToPlaylistParts";

type SongAddToPlaylistViewProps = {
  addToPlaylist: (playlistId: number) => void;
  listState: LibraryCollectionListState;
  mutationState: SongAddToPlaylistMutationState;
  query: string;
  setQuery: (query: string) => void;
  songId: number;
  statusLabel: string;
};

export function SongAddToPlaylistView({
  addToPlaylist,
  listState,
  mutationState,
  query,
  setQuery,
  songId,
  statusLabel,
}: SongAddToPlaylistViewProps) {
  const theme = useCustomizationTheme();
  const copy = getSongAddToPlaylistCopy();

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-[18px] px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <SongAddToPlaylistHeader songId={songId} theme={theme} />

      <LibraryCollectionListSearch
        onChangeQuery={setQuery}
        placeholder={copy.placeholder}
        query={query}
      />

      <SongAddToPlaylistList
        addToPlaylist={addToPlaylist}
        listState={listState}
        mutationState={mutationState}
        theme={theme}
      />

      <SongAddToPlaylistStatus
        listState={listState}
        mutationState={mutationState}
        statusLabel={statusLabel}
        theme={theme}
      />
    </ScrollView>
  );
}
