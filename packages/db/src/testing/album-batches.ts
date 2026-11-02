/** Importing songs the way the app does, for the same-named album tests. */
import assert from "node:assert/strict";

import type { LibraryDb } from "../client.ts";
import type { NewSongInput } from "../library/song-writes.ts";
import { listAlbums } from "../library/albums.ts";
import { addSongs } from "../library/song-writes.ts";

let number = 0;

export function song(
  album: string,
  artists: string,
  extra: Partial<NewSongInput> = {},
) {
  number += 1;
  return {
    album,
    artists,
    durationMs: 1000,
    fileName: `${String(number)}.mp3`,
    title: `Song ${String(number)}`,
    ...extra,
  } satisfies NewSongInput;
}

/** One batch, as the app does it: a song at a time, sharing its open albums. */
export function importBatch(db: LibraryDb, ...songs: NewSongInput[]) {
  const openAlbums = new Set<number>();
  return songs.map((input) => {
    const [added] = addSongs(db, [input], { openAlbums }).value;
    assert.ok(added);
    return added;
  });
}

/** Every album: its name, artists, and how many songs, sorted. */
export function albumsOf(db: LibraryDb) {
  return listAlbums(db)
    .map((album) => ({
      artists: album.artists.map((artist) => artist.name),
      name: album.name,
      songs: album.songCount,
    }))
    .sort((a, b) => a.artists.join().localeCompare(b.artists.join()));
}
