import { useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";

import { countSongsInPlaylists, listPlaylists } from "@synq/db";

import type { RowMark } from "~/features/library/collection-row";
import { SymbolIcon } from "~/components/symbol-icon";
import { changePlaylists } from "~/features/library/actions";
import {
  COLLECTION_ROW_HEIGHT,
  CollectionRow,
} from "~/features/library/collection-row";
import { songCount } from "~/features/library/format";
import { songIdsParam } from "~/features/library/params";
import {
  markOf,
  playlistChange,
  toggled,
} from "~/features/library/playlist-choices";
import { useLibraryQuery } from "~/features/library/queries";
import { selectionTick } from "~/lib/haptics";

/** The top row: an accent `plus` where a playlist's artwork would be. */
function NewPlaylistRow({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      className="active:bg-fill flex-row items-center pl-4"
      style={{ height: COLLECTION_ROW_HEIGHT }}
      onPress={onPress}
    >
      <View className="bg-fill size-14 items-center justify-center rounded-md">
        <SymbolIcon name="plus" size={22} tintColorClassName="accent-accent" />
      </View>
      <View className="border-b-hairline border-separator ml-3 h-full flex-1 justify-center">
        <Text className="text-body text-accent">New Playlist…</Text>
      </View>
    </Pressable>
  );
}

/**
 * Puts songs (`songs`, comma-separated ids) in playlists and takes them out:
 * a checklist of playlists, Liked Songs first, each checked when it holds
 * every song and marked with a dash when it holds some. Done writes what was
 * tapped; Cancel or a swipe down discards it. New Playlist, at the top,
 * starts with the songs and comes back here, checked.
 */
export default function AddToPlaylistScreen() {
  const { songs } = useLocalSearchParams<{ songs?: string }>();
  const songIds = [...new Set(songIdsParam(songs))];
  const playlists = useLibraryQuery({
    key: ["playlists", "name", "asc"],
    read: (db) => listPlaylists(db, { order: "asc", sort: "name" }),
    select: (items) => items,
  });
  const held = useLibraryQuery({
    key: ["playlists-holding", songs],
    read: (db) => countSongsInPlaylists(db, songIds),
    select: (rows) =>
      new Map(rows.map((row) => [row.playlistId, row.count] as const)),
  });
  const [chosen, setChosen] = useState<ReadonlyMap<number, RowMark>>(
    () => new Map(),
  );
  // Done closes the sheet; a second tap must not write twice.
  const finished = useRef(false);
  function start(playlistId: number) {
    return markOf(held.get(playlistId) ?? 0, songIds.length);
  }
  return (
    <>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon="xmark"
          accessibilityLabel="Cancel"
          onPress={() => router.back()}
        />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="checkmark"
          accessibilityLabel="Done"
          variant="prominent"
          onPress={() => {
            if (finished.current) return;
            finished.current = true;
            changePlaylists(songIds, playlistChange(start, chosen));
            router.back();
          }}
        />
      </Stack.Toolbar>
      <ScrollView
        className="bg-background flex-1"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="pt-2 pb-8">
          <NewPlaylistRow
            onPress={() =>
              router.push({ params: { songs }, pathname: "/new-playlist" })
            }
          />
          {playlists.map((playlist) => (
            <CollectionRow
              key={playlist.id}
              artwork={playlist.artwork}
              placeholder={playlist.kind === "liked" ? "liked" : "playlist"}
              name={playlist.name}
              detail={songCount(playlist.songCount)}
              mark={chosen.get(playlist.id) ?? start(playlist.id)}
              onPress={() => {
                selectionTick();
                setChosen((current) =>
                  new Map(current).set(
                    playlist.id,
                    toggled(current.get(playlist.id) ?? start(playlist.id)),
                  ),
                );
              }}
            />
          ))}
        </View>
      </ScrollView>
    </>
  );
}
