import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionListState } from "../services/library-collection-list-service";
import type { getSongAddToPlaylistHeaderState } from "../services/song-add-to-playlist-header-state-service";
import type { SongAddToPlaylistRowState } from "../services/song-add-to-playlist-row-state-service";
import type { SongAddToPlaylistStatusState } from "../services/song-add-to-playlist-status-state-service";
import { LibraryCollectionListSearch } from "./LibraryCollectionListSearch";
import {
  SongAddToPlaylistHeader,
  SongAddToPlaylistList,
  SongAddToPlaylistStatus,
} from "./song-add-to-playlist";

type SongAddToPlaylistViewProps = {
  addToPlaylist: (playlistId: number) => void;
  copy: ReturnType<typeof getSongAddToPlaylistHeaderState>["copy"];
  headerState: ReturnType<typeof getSongAddToPlaylistHeaderState>;
  listState: LibraryCollectionListState;
  query: string;
  rowStates: SongAddToPlaylistRowState[];
  setQuery: (query: string) => void;
  statusState: SongAddToPlaylistStatusState;
};

export function SongAddToPlaylistView({
  addToPlaylist,
  copy,
  headerState,
  listState,
  query,
  rowStates,
  setQuery,
  statusState,
}: SongAddToPlaylistViewProps) {
  const theme = useCustomizationTheme();

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-[18px] px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <SongAddToPlaylistHeader headerState={headerState} theme={theme} />

      <LibraryCollectionListSearch
        onChangeQuery={setQuery}
        placeholder={copy.placeholder}
        query={query}
      />

      <SongAddToPlaylistList
        addToPlaylist={addToPlaylist}
        listState={listState}
        rowStates={rowStates}
        theme={theme}
      />

      <SongAddToPlaylistStatus statusState={statusState} theme={theme} />
    </ScrollView>
  );
}
