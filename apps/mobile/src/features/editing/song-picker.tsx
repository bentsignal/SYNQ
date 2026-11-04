import { useRef, useState, useSyncExternalStore } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack } from "expo-router";

import type { SongListItem } from "@synq/db";
import { listSongs } from "@synq/db";

import type { SongPick } from "./song-selection";
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
import { selectionTick } from "~/lib/haptics";
import { createSongSelection } from "./song-selection";

type SongSelection = ReturnType<typeof createSongSelection<SongListItem>>;

const ARTWORK_SIZE = 48;
const LEADING = 16;
const GAP = 12;
const MARK_SIZE = 24;

/** The trailing circle: empty, or filled with a check. Plain views, for a list of thousands. */
function Mark({ chosen }: { chosen: boolean }) {
  if (!chosen) {
    return (
      <View
        className="border-subtle rounded-full border"
        style={{ height: MARK_SIZE, width: MARK_SIZE }}
      />
    );
  }
  return (
    <View
      className="bg-accent items-center justify-center rounded-full"
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
 * props and the selection.
 */
export function PickerRow({
  song,
  selection,
}: {
  song: SongListItem;
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
      accessibilityState={{ selected: chosen }}
      className="active:bg-fill flex-row items-center"
      style={{ height: SONG_ROW_HEIGHT, paddingLeft: LEADING }}
      onPress={() => {
        selectionTick();
        selection.toggle(song);
      }}
    >
      <Artwork artwork={song.artwork} placeholder="song" size={ARTWORK_SIZE} />
      <View
        className="h-full flex-1 flex-row items-center pr-4"
        style={{ gap: GAP, marginLeft: GAP }}
      >
        <View className="flex-1">
          <Text numberOfLines={1} className="text-body text-foreground">
            {song.title}
          </Text>
          <Text numberOfLines={1} className="text-subhead text-muted">
            {detail}
          </Text>
        </View>
        <Mark chosen={chosen} />
      </View>
      <RowSeparator inset={LEADING + ARTWORK_SIZE + GAP} />
    </Pressable>
  );
}

/**
 * The bar: how many are chosen, Select All for what's listed, and Done, which
 * waits for a change. Cancel is for a picker that opens as its own sheet.
 */
function PickerToolbar({
  selection,
  listed,
  onCancel,
  onDone,
}: {
  selection: SongSelection;
  /** The songs listed now. */
  listed: readonly SongListItem[];
  onCancel?: () => void;
  onDone: () => void;
}) {
  const count = useSyncExternalStore(selection.subscribe, selection.size);
  const allChosen = useSyncExternalStore(selection.subscribe, () =>
    selection.allChosen(listed),
  );
  const hasChanges = useSyncExternalStore(
    selection.subscribe,
    selection.hasChanges,
  );
  const title =
    count === 0 ? "Add Songs" : `${count.toLocaleString("en-US")} Selected`;
  return (
    <>
      <Stack.Screen options={{ title }} />
      {onCancel !== undefined && (
        <Stack.Toolbar placement="left">
          <Stack.Toolbar.Button
            icon="xmark"
            accessibilityLabel="Cancel"
            onPress={onCancel}
          />
        </Stack.Toolbar>
      )}
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
          disabled={!hasChanges}
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
 * Picks an album's or a playlist's songs from the library, in the sort of the
 * Songs list, with the songs already there first: tap to put one in or take
 * it out, search to narrow what's listed (choices stay through a search),
 * Select All for what's listed. Back or Cancel discards. `onDone` gets what
 * changed, and returning false keeps the picker up to try again.
 */
export function SongPicker({
  present,
  onCancel,
  onDone,
}: {
  /** The ids of the songs already there, in their order. */
  present: readonly number[];
  onCancel?: () => void;
  onDone: (pick: SongPick<SongListItem>) => boolean;
}) {
  const [selection] = useState(() =>
    createSongSelection<SongListItem>(present),
  );
  const background = useNativeColor("--color-background-elevated");
  // Done pops the screen; a second tap must not add them twice.
  const finished = useRef(false);
  const sort = songSort.useValue();
  const { items, query, search } = useSearchableList({
    key: ["songs", sort.key, sort.order],
    read: (db, text) =>
      listSongs(db, { order: sort.order, search: text, sort: sort.key }),
  });
  // Fixed while the picker is open, so a tap never moves a row.
  const listed = [
    ...items.filter((song) => selection.isOriginal(song.id)),
    ...items.filter((song) => !selection.isOriginal(song.id)),
  ];
  return (
    <>
      <PickerToolbar
        selection={selection}
        listed={listed}
        onCancel={onCancel}
        onDone={() => {
          if (finished.current) return;
          finished.current = onDone(selection.pick());
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
        data={listed}
        style={{ backgroundColor: background }}
        keyExtractor={(song) => String(song.id)}
        getFixedItemSize={() => SONG_ROW_HEIGHT}
        estimatedItemSize={SONG_ROW_HEIGHT}
        ListEmptyComponent={<Empty query={query} />}
        renderItem={({ item }) => (
          <PickerRow song={item} selection={selection} />
        )}
      />
    </>
  );
}
