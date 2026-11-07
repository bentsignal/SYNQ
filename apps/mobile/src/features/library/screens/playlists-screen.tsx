import { listPlaylists } from "@synq/db";

import { EmptyState } from "~/components/empty-state";
import { ScreenList } from "~/components/screen-list";
import { TabTitle } from "~/components/tab-title";
import { playlistMenu } from "../collection-menu";
import { COLLECTION_ROW_HEIGHT, CollectionRow } from "../collection-row";
import { songCount } from "../format";
import { openLibraryScreen, openNewPlaylist } from "../links";
import {
  LibrarySearchBar,
  NoResults,
  useSearchableList,
} from "../searchable-list";
import { playlistsSort } from "../sort";
import { SortToolbar } from "../sort-toolbar";

function Empty({ query }: { query: string }) {
  if (query !== "") return <NoResults query={query} />;
  return (
    <EmptyState
      icon="music.note.list"
      title="No Playlists"
      actions={[{ label: "New Playlist", onPress: openNewPlaylist }]}
    />
  );
}

/** Playlists, Liked Songs always first, with New Playlist in the toolbar. */
export default function PlaylistsScreen() {
  const sort = playlistsSort.useValue();
  const { items, query, search } = useSearchableList({
    key: ["playlists", sort.key, sort.order],
    read: (db, text) =>
      listPlaylists(db, { order: sort.order, search: text, sort: sort.key }),
  });
  return (
    <>
      <TabTitle title="Playlists" />
      <SortToolbar
        store={playlistsSort}
        sort={sort}
        add={{ label: "New Playlist", onPress: openNewPlaylist }}
      />
      <LibrarySearchBar placeholder="Search Playlists" search={search} />
      <ScreenList
        data={items}
        keyExtractor={(playlist) => String(playlist.id)}
        getFixedItemSize={() => COLLECTION_ROW_HEIGHT}
        estimatedItemSize={COLLECTION_ROW_HEIGHT}
        ListEmptyComponent={<Empty query={query} />}
        renderItem={({ item }) => (
          <CollectionRow
            artwork={item.artwork}
            placeholder={item.kind === "liked" ? "liked" : "playlist"}
            name={item.name}
            detail={songCount(item.songCount)}
            menu={playlistMenu(item)}
            onPress={() =>
              openLibraryScreen({ id: item.id, screen: "playlist" })
            }
          />
        )}
      />
    </>
  );
}
