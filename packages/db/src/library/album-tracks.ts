import { and, asc, eq, inArray } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import {
  albumArtists,
  albums,
  albumSongs,
  songArtists,
  songs,
} from "../schema.ts";
import { listAlbumTracks, listEmptyAlbums } from "./albums.ts";
import { changesOf, written } from "./changes.ts";
import { LibraryError } from "./errors.ts";
import { uniqueIds } from "./find-or-create.ts";
import { appendAlbumArtists } from "./song-writes.ts";
import { chunked } from "./text.ts";

/**
 * Adds songs to the end of an album, in the given order. Each song moves out
 * of its primary album and this one becomes its primary (a second album it's
 * also on stays). Songs already on the album are left where they are, and
 * reported in `skipped`.
 *
 * New tracks number on from the last one. An unnumbered track sorts after
 * every numbered one, so when the album has any, its tracks are first
 * numbered 1..n in their current order, or the new ones wouldn't land last.
 * An album with no artists takes the added songs' artists (as an import
 * credits them), so one built from existing songs isn't left unattributed;
 * an album that has artists keeps its credits. Albums a song leaves are kept
 * even when emptied, as `deleteSongs` keeps them, with their covers; `emptied`
 * names the ones this left with no songs, so the app can offer to delete them.
 */
export function addSongsToAlbum(
  db: LibraryDb,
  albumId: number,
  songIds: readonly number[],
) {
  const result = db.transaction((tx) => {
    if (
      !tx
        .select({ id: albums.id })
        .from(albums)
        .where(eq(albums.id, albumId))
        .get()
    )
      throw new LibraryError("not-found", `No album ${albumId}`);
    const tracks = listAlbumTracks(tx, albumId);
    const present = new Set(tracks.map((track) => track.id));
    const wanted = uniqueIds(songIds);
    const existing = new Set(
      chunked(wanted).flatMap((ids) =>
        tx
          .select({ id: songs.id })
          .from(songs)
          .where(inArray(songs.id, ids))
          .all()
          .map((row) => row.id),
      ),
    );
    const added = wanted.filter((id) => existing.has(id) && !present.has(id));
    const skipped = wanted.filter((id) => !existing.has(id) || present.has(id));
    if (added.length === 0) return { added, emptied: [], skipped };

    const numbered = tracks.every((track) => track.track !== null);
    if (!numbered) {
      tracks.forEach((track, index) => {
        tx.update(albumSongs)
          .set({ track: index + 1 })
          .where(
            and(
              eq(albumSongs.albumId, albumId),
              eq(albumSongs.songId, track.id),
            ),
          )
          .run();
      });
    }
    const last = numbered
      ? Math.max(0, ...tracks.map((track) => track.track ?? 0))
      : tracks.length;
    const left = moveToAlbum(tx, albumId, added, last + 1);
    creditArtistsIfNone(tx, albumId, added);
    markModified(tx, added);
    return { added, emptied: listEmptyAlbums(tx, left), skipped };
  });
  return written(
    result,
    result.added.length > 0 ? ["album_songs", "album_artists", "songs"] : [],
  );
}

/**
 * Takes songs off an album; they stay in the library. `emptied` has the album if
 * that was its last song.
 */
export function removeSongsFromAlbum(
  db: LibraryDb,
  albumId: number,
  songIds: readonly number[],
) {
  const removed = db.transaction((tx) => {
    const ids = uniqueIds(songIds);
    let count = 0;
    for (const chunk of chunked(ids)) {
      count += changesOf(
        tx
          .delete(albumSongs)
          .where(
            and(
              eq(albumSongs.albumId, albumId),
              inArray(albumSongs.songId, chunk),
            ),
          )
          .run(),
      );
    }
    if (count > 0) markModified(tx, ids);
    return { count, emptied: count > 0 ? listEmptyAlbums(tx, [albumId]) : [] };
  });
  return written(
    { emptied: removed.emptied, removed: removed.count },
    removed.count > 0 ? ["album_songs", "songs"] : [],
  );
}

/**
 * Makes an album hold exactly these songs in this order (an edit sheet's
 * Done). Tracks only renumber 1..n if the order the numbers already give
 * differs, so saving a sheet that didn't reorder leaves the album's own
 * numbers alone. `emptied` names the other albums the added songs left with
 * no songs.
 */
export function setAlbumTracks(
  db: LibraryDb,
  albumId: number,
  songIds: readonly number[],
) {
  const emptied = db.transaction((tx) => {
    const wanted = uniqueIds(songIds);
    const wantedSet = new Set(wanted);
    const current = listAlbumTracks(tx, albumId).map((track) => track.id);
    const currentSet = new Set(current);
    removeSongsFromAlbum(
      tx,
      albumId,
      current.filter((id) => !wantedSet.has(id)),
    );
    const added = addSongsToAlbum(
      tx,
      albumId,
      wanted.filter((id) => !currentSet.has(id)),
    );
    const order = listAlbumTracks(tx, albumId).map((track) => track.id);
    if (order.some((id, index) => id !== wanted[index])) {
      reorderAlbumTracks(tx, albumId, wanted);
    }
    return added.value.emptied;
  });
  return written({ emptied }, ["album_songs", "album_artists", "songs"]);
}

/**
 * Replaces each song's primary album with this one, keeping its place in the
 * song's album order so any other album stays secondary. Returns the albums
 * they left.
 */
function moveToAlbum(
  tx: LibraryDb,
  albumId: number,
  songIds: readonly number[],
  firstTrack: number,
) {
  const primaries = new Map<number, { albumId: number; position: number }>();
  for (const ids of chunked(songIds)) {
    const rows = tx
      .select({
        albumId: albumSongs.albumId,
        position: albumSongs.position,
        songId: albumSongs.songId,
      })
      .from(albumSongs)
      .where(inArray(albumSongs.songId, ids))
      .orderBy(asc(albumSongs.songId), asc(albumSongs.position))
      .all();
    for (const row of rows) {
      if (!primaries.has(row.songId)) primaries.set(row.songId, row);
    }
  }
  const leaving = new Map<number, number[]>();
  for (const [songId, primary] of primaries) {
    const list = leaving.get(primary.albumId);
    if (list) list.push(songId);
    else leaving.set(primary.albumId, [songId]);
  }
  for (const [oldAlbumId, ids] of leaving) {
    for (const chunk of chunked(ids)) {
      tx.delete(albumSongs)
        .where(
          and(
            eq(albumSongs.albumId, oldAlbumId),
            inArray(albumSongs.songId, chunk),
          ),
        )
        .run();
    }
  }
  const rows = songIds.map((songId, index) => ({
    albumId,
    position: primaries.get(songId)?.position ?? 0,
    songId,
    track: firstTrack + index,
  }));
  for (const chunk of chunked(rows)) tx.insert(albumSongs).values(chunk).run();
  return [...leaving.keys()];
}

function creditArtistsIfNone(
  tx: LibraryDb,
  albumId: number,
  songIds: readonly number[],
) {
  const credited = tx
    .select({ id: albumArtists.artistId })
    .from(albumArtists)
    .where(eq(albumArtists.albumId, albumId))
    .get();
  if (credited) return;
  const credits = chunked(songIds).flatMap((ids) =>
    tx
      .select({ artistId: songArtists.artistId, songId: songArtists.songId })
      .from(songArtists)
      .where(inArray(songArtists.songId, ids))
      .orderBy(asc(songArtists.position))
      .all(),
  );
  const order = new Map(songIds.map((id, index) => [id, index]));
  const inSongOrder = credits.sort(
    (a, b) => (order.get(a.songId) ?? 0) - (order.get(b.songId) ?? 0),
  );
  appendAlbumArtists(
    tx,
    albumId,
    uniqueIds(inSongOrder.map((credit) => credit.artistId)),
  );
}

/** A song's album and track are written into its tags on export. */
function markModified(tx: LibraryDb, songIds: readonly number[]) {
  for (const ids of chunked(songIds)) {
    tx.update(songs)
      .set({ modifiedSinceExport: true })
      .where(inArray(songs.id, ids))
      .run();
  }
}

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
