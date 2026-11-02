import { Stack } from "expo-router";

import { listPlaylists } from "@synq/db";

import { EmptyState } from "~/components/empty-state";
import { ScreenList } from "~/components/screen-list";
import { TabTitle } from "~/components/tab-title";
import { COLLECTION_ROW_HEIGHT, CollectionRow } from "../collection-row";
import { songCount } from "../format";
import { openLibraryScreen, openNewPlaylist } from "../links";
import {
  LibrarySearchBar,
  NoResults,
  useSearchableList,
} from "../searchable-list";
import { playlistsSort } from "../sort";
import { sortMenuItems } from "../sort-menu";

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
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu
          icon="arrow.up.arrow.down"
          accessibilityLabel="Sort"
        >
          {sortMenuItems({ sort, store: playlistsSort })}
        </Stack.Toolbar.Menu>
        <Stack.Toolbar.Button
          icon="plus"
          accessibilityLabel="New Playlist"
          onPress={openNewPlaylist}
        />
      </Stack.Toolbar>
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
            onPress={() =>
              openLibraryScreen({ id: item.id, screen: "playlist" })
            }
          />
        )}
      />
    </>
  );
}
