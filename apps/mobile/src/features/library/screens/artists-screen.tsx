import { router } from "expo-router";

import { listArtists } from "@synq/db";

import { EmptyState } from "~/components/empty-state";
import { ScreenList } from "~/components/screen-list";
import { TabTitle } from "~/components/tab-title";
import { COLLECTION_ROW_HEIGHT, CollectionRow } from "../collection-row";
import { songCount } from "../format";
import { openLibraryScreen } from "../links";
import {
  LibrarySearchBar,
  NoResults,
  useSearchableList,
} from "../searchable-list";
import { artistSort } from "../sort";
import { SortToolbar } from "../sort-menu";

function Empty({ query }: { query: string }) {
  if (query !== "") return <NoResults query={query} />;
  return (
    <EmptyState className="pt-24" icon="music.microphone" title="No Artists" />
  );
}

export default function ArtistsScreen() {
  const sort = artistSort.use();
  const { items, query, search } = useSearchableList({
    key: ["artists", sort.key, sort.order],
    read: (db, text) =>
      listArtists(db, { order: sort.order, search: text, sort: sort.key }),
  });
  return (
    <>
      <TabTitle title="Artists" />
      <SortToolbar
        store={artistSort}
        sort={sort}
        add={{ label: "New Artist", onPress: () => router.push("/new-artist") }}
      />
      <LibrarySearchBar placeholder="Search Artists" search={search} />
      <ScreenList
        data={items}
        keyExtractor={(artist) => String(artist.id)}
        getFixedItemSize={() => COLLECTION_ROW_HEIGHT}
        estimatedItemSize={COLLECTION_ROW_HEIGHT}
        ListEmptyComponent={<Empty query={query} />}
        renderItem={({ item }) => (
          <CollectionRow
            artwork={item.artwork}
            placeholder="artist"
            name={item.name}
            detail={songCount(item.songCount)}
            onPress={() =>
              openLibraryScreen({ id: item.id, screen: "artist" })
            }
          />
        )}
      />
    </>
  );
}
