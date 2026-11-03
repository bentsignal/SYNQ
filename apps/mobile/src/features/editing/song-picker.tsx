import { useRef, useState, useSyncExternalStore } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack } from "expo-router";

import type { SongListItem } from "@synq/db";
import { listSongs } from "@synq/db";

import { Artwork } from "~/components/artwork";
import { EmptyState } from "~/components/empty-state";
import { useNativeColor } from "~/components/native-host";
import { RowSeparator } from "~/components/row-separator";
import { ScreenList } from "~/components/screen-list";
import { SymbolIcon } from "~/components/symbol-icon";
import { songDetail } from "~/features/library/format";
import {
  NoResults,
  useSearchableList,
} from "~/features/library/searchable-list";
import { SONG_ROW_HEIGHT } from "~/features/library/song-row";
import { songSort } from "~/features/library/sort";
import { cn } from "~/lib/cn";
import { selectionTick } from "~/lib/haptics";
import { createSongSelection } from "./song-selection";

type SongSelection = ReturnType<typeof createSongSelection<SongListItem>>;

const ARTWORK_SIZE = 48;
const LEADING = 16;
const GAP = 12;
const MARK_SIZE = 24;

/** The trailing circle: empty, or filled with a check. Plain views, for a list of thousands. */
function Mark({ chosen, added }: { chosen: boolean; added: boolean }) {
  if (!chosen && !added) {
    return (
      <View
        className="border-subtle rounded-full border"
        style={{ height: MARK_SIZE, width: MARK_SIZE }}
      />
    );
  }
  return (
    <View
      className={cn(
        "items-center justify-center rounded-full",
        added ? "bg-subtle" : "bg-accent",
      )}
      style={{ height: MARK_SIZE, width: MARK_SIZE }}
    >
      <SymbolIcon
        name="checkmark"
        size={12}
        weight="bold"
        tintColorClassName="accent-on-accent"
      />
    </View>
  );
}

/**
 * A song in the picker. Rows are recycled, so what they show comes only from
 * props and the selection. A song already there is dimmed and can't be tapped.
 */
export function PickerRow({
  song,
  added,
  selection,
}: {
  song: SongListItem;
  added: boolean;
  selection: SongSelection;
}) {
  const chosen = useSyncExternalStore(selection.subscribe, () =>
    selection.has(song.id),
  );
  const detail = songDetail(song);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${song.title}, ${detail}`}
      accessibilityState={{ disabled: added, selected: chosen || added }}
      disabled={added}
      className="active:bg-fill flex-row items-center"
      style={{ height: SONG_ROW_HEIGHT, paddingLeft: LEADING }}
      onPress={() => {
        selectionTick();
        selection.toggle(song);
      }}
    >
      <View style={{ opacity: added ? 0.4 : 1 }}>
        <Artwork
          artwork={song.artwork}
          placeholder="song"
          size={ARTWORK_SIZE}
        />
      </View>
      <View
        className="h-full flex-1 flex-row items-center pr-4"
        style={{ gap: GAP, marginLeft: GAP }}
      >
        <View className="flex-1" style={{ opacity: added ? 0.4 : 1 }}>
          <Text numberOfLines={1} className="text-body text-foreground">
            {song.title}
          </Text>
          <Text numberOfLines={1} className="text-subhead text-muted">
            {detail}
          </Text>
        </View>
        <Mark chosen={chosen} added={added} />
      </View>
      <RowSeparator inset={LEADING + ARTWORK_SIZE + GAP} />
    </Pressable>
  );
}

/** The bar: how many are chosen, Select All for what's listed, and Done. */
function PickerToolbar({
  selection,
  listed,
  onDone,
}: {
  selection: SongSelection;
  /** The songs listed now that can be chosen. */
  listed: readonly SongListItem[];
  onDone: () => void;
}) {
  const count = useSyncExternalStore(selection.subscribe, selection.size);
  const allChosen = useSyncExternalStore(selection.subscribe, () =>
    selection.allChosen(listed),
  );
  const title =
    count === 0 ? "Add Songs" : `${count.toLocaleString("en-US")} Selected`;
  return (
    <>
      <Stack.Screen options={{ title }} />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          disabled={listed.length === 0}
          onPress={() => {
            selectionTick();
            if (allChosen) selection.unchoose(listed);
            else selection.choose(listed);
          }}
        >
          {allChosen ? "Deselect All" : "Select All"}
        </Stack.Toolbar.Button>
        <Stack.Toolbar.Button
          icon="checkmark"
          accessibilityLabel="Done"
          variant="prominent"
          disabled={count === 0}
          onPress={onDone}
        />
      </Stack.Toolbar>
    </>
  );
}

function Empty({ query }: { query: string }) {
  if (query !== "") return <NoResults query={query} />;
  return <EmptyState icon="music.note" title="No Songs" />;
}

/**
 * Picks songs from the library for an album or a playlist, in the sort of
 * the Songs list: tap to choose several, search to narrow what's listed
 * (choices stay through a search), Select All for what's listed. Back
 * discards. `onDone` gets the songs in the order they were chosen.
 */
export function SongPicker({
  added,
  onDone,
}: {
  /** Songs already there, shown dimmed. */
  added: ReadonlySet<number>;
  onDone: (songs: SongListItem[]) => void;
}) {
  const [selection] = useState(() => createSongSelection<SongListItem>());
  const background = useNativeColor("--color-background-elevated");
  // Done pops the screen; a second tap must not add them twice.
  const finished = useRef(false);
  const sort = songSort.useValue();
  const { items, query, search } = useSearchableList({
    key: ["songs", sort.key, sort.order],
    read: (db, text) =>
      listSongs(db, { order: sort.order, search: text, sort: sort.key }),
  });
  return (
    <>
      <PickerToolbar
        selection={selection}
        listed={items.filter((song) => !added.has(song.id))}
        onDone={() => {
          if (finished.current) return;
          finished.current = true;
          onDone(selection.songs());
        }}
      />
      <Stack.SearchBar
        placeholder="Search Songs"
        hideWhenScrolling={false}
        hideNavigationBar={false}
        obscureBackground={false}
        onChangeText={(event) => search.onChangeText(event.nativeEvent.text)}
        onCancelButtonPress={search.clear}
      />
      <ScreenList
        data={items}
        style={{ backgroundColor: background }}
        keyExtractor={(song) => String(song.id)}
        getFixedItemSize={() => SONG_ROW_HEIGHT}
        estimatedItemSize={SONG_ROW_HEIGHT}
        ListEmptyComponent={<Empty query={query} />}
        renderItem={({ item }) => (
          <PickerRow
            song={item}
            added={added.has(item.id)}
            selection={selection}
          />
        )}
      />
    </>
  );
}
