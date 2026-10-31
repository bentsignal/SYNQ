import { listSongs } from "@synq/db";

import { EmptyState } from "~/components/empty-state";
import { ScreenList } from "~/components/screen-list";
import { TabTitle } from "~/components/tab-title";
import { playSongs } from "~/features/player/actions";
import { openImport } from "../links";
import { PlayShuffleButtons } from "../play-shuffle-buttons";
import {
  LibrarySearchBar,
  NoResults,
  useSearchableList,
} from "../searchable-list";
import { SONG_ROW_HEIGHT, SongRow } from "../song-row";
import { songSort } from "../sort";
import { SortToolbar } from "../sort-toolbar";

const SOURCE = { kind: "library" } as const;

function Empty({ query }: { query: string }) {
  if (query !== "") return <NoResults query={query} />;
  return (
    <EmptyState
      className="pt-24"
      icon="music.note"
      title="No Songs"
      actions={[{ label: "Import Music", onPress: () => openImport("files") }]}
    />
  );
}

/** Every song, sortable and searchable, with Play and Shuffle on top. */
export default function SongsScreen() {
  const sort = songSort.useValue();
  const { items, query, search, empty } = useSearchableList({
    key: ["songs", sort.key, sort.order],
    read: (db, text) =>
      listSongs(db, { order: sort.order, search: text, sort: sort.key }),
  });
  function ids() {
    return items.map((song) => song.id);
  }
  return (
    <>
      <TabTitle title="Songs" />
      <SortToolbar store={songSort} sort={sort} />
      <LibrarySearchBar placeholder="Search Songs" search={search} />
      <ScreenList
        data={items}
        keyExtractor={(song) => String(song.id)}
        getFixedItemSize={() => SONG_ROW_HEIGHT}
        estimatedItemSize={SONG_ROW_HEIGHT}
        ListHeaderComponent={
          empty ? null : <PlayShuffleButtons songIds={ids} source={SOURCE} />
        }
        ListEmptyComponent={<Empty query={query} />}
        renderItem={({ item, index }) => (
          <SongRow
            song={item}
            onPress={() =>
              playSongs(ids(), { source: SOURCE, startIndex: index })
            }
          />
        )}
      />
    </>
  );
}
