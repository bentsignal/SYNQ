import type { SongListItem } from "@synq/db";
import { getSongItems } from "@synq/db";

import { libraryDb } from "~/features/library/database";
import { queryClient } from "~/lib/query-client";
import { getPlayerState } from "./store";

/**
 * The queue's songs, by id. A library query, so `writeLibrary` refreshes
 * it: an edit shows in the player at once, and a deleted song leaves the
 * queue (`startup.ts`).
 */
export type PlayerSongs = ReadonlyMap<number, SongListItem>;

/** For `useLibraryQuery`, which adds the "library" prefix. */
export const PLAYER_SONGS_KEY = ["player", "songs"] as const;
export const PLAYER_SONGS_QUERY = ["library", ...PLAYER_SONGS_KEY];

function songMap(items: readonly SongListItem[]) {
  return new Map(items.map((song) => [song.id, song] as const));
}

export function loadSongs(songIds: readonly number[]) {
  return songMap(getSongItems(libraryDb(), songIds));
}

/** The query's read: every song in the queue now. */
export function readPlayerSongs() {
  return loadSongs(getPlayerState().queue.entries.map((entry) => entry.songId));
}

export function cachedSongs() {
  return (
    queryClient.getQueryData<PlayerSongs>(PLAYER_SONGS_QUERY) ??
    new Map<number, SongListItem>()
  );
}

let setting = false;

/** True while the player itself writes the query (so it ignores its own update). */
export function isSettingSongs() {
  return setting;
}

export function setSongs(songs: PlayerSongs) {
  setting = true;
  queryClient.setQueryData(PLAYER_SONGS_QUERY, songs);
  setting = false;
}

export function addSongs(songs: PlayerSongs) {
  setSongs(new Map([...cachedSongs(), ...songs]));
}

export function songTitle(songId: number) {
  return cachedSongs().get(songId)?.title;
}
