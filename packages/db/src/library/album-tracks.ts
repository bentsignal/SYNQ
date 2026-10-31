import { and, eq } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import { albumSongs } from "../schema.ts";
import { changesOf, written } from "./changes.ts";
import { LibraryError } from "./errors.ts";
import { uniqueIds } from "./find-or-create.ts";

/**
 * Sets track numbers 1..n in the given order (2.5.2's reorder screen did the
 * same). Album songs not listed keep their track numbers.
 */
export function reorderAlbumTracks(
  db: LibraryDb,
  albumId: number,
  songIds: readonly number[],
) {
  db.transaction((tx) => {
    uniqueIds(songIds).forEach((songId, index) => {
      tx.update(albumSongs)
        .set({ track: index + 1 })
        .where(
          and(eq(albumSongs.albumId, albumId), eq(albumSongs.songId, songId)),
        )
        .run();
    });
  });
  return written(undefined, ["album_songs"]);
}

export function setTrackNumber(
  db: LibraryDb,
  albumId: number,
  songId: number,
  track: number | null,
) {
  const updated = changesOf(
    db
      .update(albumSongs)
      .set({ track })
      .where(
        and(eq(albumSongs.albumId, albumId), eq(albumSongs.songId, songId)),
      )
      .run(),
  );
  if (updated === 0)
    throw new LibraryError(
      "not-found",
      `Song ${songId} is not on album ${albumId}`,
    );
  return written(undefined, ["album_songs"]);
}
