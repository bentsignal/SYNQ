import { router } from "expo-router";

import type { AlbumListItem, LibraryDb, SortOrder } from "@synq/db";
import { compareText, listAlbums } from "@synq/db";

import type { Sort } from "../sort";
import { EmptyState } from "~/components/empty-state";
import { ScreenList } from "~/components/screen-list";
import { TabTitle } from "~/components/tab-title";
import { COLLECTION_ROW_HEIGHT, CollectionRow } from "../collection-row";
import { albumDetail } from "../format";
import { openLibraryScreen } from "../links";
import {
  LibrarySearchBar,
  NoResults,
  useSearchableList,
} from "../searchable-list";
import { albumSort } from "../sort";
import { SortToolbar } from "../sort-toolbar";

type AlbumSortKey = (typeof albumSort.keys)[number]["value"];

/** By the first credited artist, then name; albums without one go last. */
function byArtist(albums: AlbumListItem[], order: SortOrder) {
  const direction = order === "asc" ? 1 : -1;
  return albums.sort((a, b) => {
    const left = a.artists[0]?.name;
    const right = b.artists[0]?.name;
    if (left === undefined || right === undefined) {
      return left === right ? compareText(a.name, b.name) : left ? -1 : 1;
    }
    return (
      direction * (compareText(left, right) || compareText(a.name, b.name))
    );
  });
}

function readAlbums(db: LibraryDb, sort: Sort<AlbumSortKey>, search?: string) {
  if (sort.key === "artist") {
    return byArtist(listAlbums(db, { search }), sort.order);
  }
  return listAlbums(db, { order: sort.order, search, sort: sort.key });
}

function Empty({ query }: { query: string }) {
  if (query !== "") return <NoResults query={query} />;
  return <EmptyState icon="square.stack" title="No Albums" />;
}

export default function AlbumsScreen() {
  const sort = albumSort.useValue();
  const { items, query, search } = useSearchableList({
    key: ["albums", sort.key, sort.order],
    read: (db, text) => readAlbums(db, sort, text),
  });
  return (
    <>
      <TabTitle title="Albums" />
      <SortToolbar
        store={albumSort}
        sort={sort}
        add={{ label: "New Album", onPress: () => router.push("/new-album") }}
      />
      <LibrarySearchBar placeholder="Search Albums" search={search} />
      <ScreenList
        data={items}
        keyExtractor={(album) => String(album.id)}
        getFixedItemSize={() => COLLECTION_ROW_HEIGHT}
        estimatedItemSize={COLLECTION_ROW_HEIGHT}
        ListEmptyComponent={<Empty query={query} />}
        renderItem={({ item }) => (
          <CollectionRow
            artwork={item.artwork}
            placeholder="album"
            name={item.name}
            detail={albumDetail(item)}
            onPress={() => openLibraryScreen({ id: item.id, screen: "album" })}
          />
        )}
      />
    </>
  );
}
