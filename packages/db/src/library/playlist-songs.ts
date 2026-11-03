import { and, asc, eq, inArray, max } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import type { WriteOptions } from "./changes.ts";
import { playlistSongs, songs } from "../schema.ts";
import { changesOf, written } from "./changes.ts";
import { LibraryError } from "./errors.ts";
import { uniqueIds } from "./find-or-create.ts";
import { requirePlaylistRow, touchPlaylist } from "./playlist-rows.ts";
import { chunked } from "./text.ts";

/**
 * Appends songs to a playlist in the given order. A playlist holds a song at
 * most once; songs already in it are reported in `skipped`, not moved.
 */
export function addSongsToPlaylist(
  db: LibraryDb,
  playlistId: number,
  songIds: readonly number[],
  options?: WriteOptions,
) {
  const result = db.transaction((tx) => {
    requirePlaylistRow(tx, playlistId);
    const present = new Set(
      tx
        .select({ id: playlistSongs.songId })
        .from(playlistSongs)
        .where(eq(playlistSongs.playlistId, playlistId))
        .all()
        .map((r) => r.id),
    );
    const existingSongs = new Set(
      chunked(uniqueIds(songIds)).flatMap((ids) =>
        tx
          .select({ id: songs.id })
          .from(songs)
          .where(inArray(songs.id, ids))
          .all()
          .map((r) => r.id),
      ),
    );
    const added = [];
    const skipped = [];
    for (const id of uniqueIds(songIds)) {
      if (present.has(id) || !existingSongs.has(id)) skipped.push(id);
      else added.push(id);
    }
    if (added.length > 0) {
      const last = tx
        .select({ value: max(playlistSongs.position) })
        .from(playlistSongs)
        .where(eq(playlistSongs.playlistId, playlistId))
        .get();
      const start = Math.floor(last?.value ?? 0) + 1;
      const rows = added.map((songId, index) => ({
        playlistId,
        songId,
        position: start + index,
      }));
      for (const chunk of chunked(rows)) {
        tx.insert(playlistSongs).values(chunk).run();
      }
      touchPlaylist(tx, playlistId, options);
    }
    return { added, skipped };
  });
  return written(
    result,
    result.added.length > 0 ? ["playlist_songs", "playlists"] : [],
  );
}

export function removeSongsFromPlaylist(
  db: LibraryDb,
  playlistId: number,
  songIds: readonly number[],
  options?: WriteOptions,
) {
  const removed = db.transaction((tx) => {
    let count = 0;
    for (const ids of chunked(uniqueIds(songIds))) {
      count += changesOf(
        tx
          .delete(playlistSongs)
          .where(
            and(
              eq(playlistSongs.playlistId, playlistId),
              inArray(playlistSongs.songId, ids),
            ),
          )
          .run(),
      );
    }
    if (count > 0) touchPlaylist(tx, playlistId, options);
    return count;
  });
  return written(
    { removed },
    removed > 0 ? ["playlist_songs", "playlists"] : [],
  );
}

/** Below this gap between neighbours, a move renumbers the playlist instead of bisecting. */
const MIN_POSITION_GAP = 1e-6;

/**
 * Moves a song to `toIndex` in the playlist's order (0-based, clamped),
 * writing only its row: the new position is the midpoint of its new
 * neighbours. When repeated moves have worn the gap down, the playlist is
 * renumbered 1..n first.
 */
export function moveSongInPlaylist(
  db: LibraryDb,
  move: { playlistId: number; songId: number; toIndex: number },
  options?: WriteOptions,
) {
  const { playlistId, songId, toIndex } = move;
  const position = db.transaction((tx) => {
    let entries = orderedEntries(tx, playlistId);
    if (!entries.some((e) => e.songId === songId)) {
      throw new LibraryError(
        "not-found",
        `Song ${songId} is not in playlist ${playlistId}`,
      );
    }
    let target = bisect(entries, songId, toIndex);
    if (target === null) {
      renumber(tx, entries);
      entries = orderedEntries(tx, playlistId);
      target = bisect(entries, songId, toIndex) ?? 0;
    }
    const current = entries.find((e) => e.songId === songId);
    if (current && current.position !== target) {
      tx.update(playlistSongs)
        .set({ position: target })
        .where(eq(playlistSongs.id, current.id))
        .run();
      touchPlaylist(tx, playlistId, options);
    }
    return target;
  });
  return written({ position }, ["playlist_songs", "playlists"]);
}

interface Entry {
  id: number;
  songId: number;
  position: number;
}

/**
 * Puts a playlist in the given order (an edit sheet's whole new order) in
 * one transaction, numbering it 1..n. Songs not listed keep their place
 * after the listed ones; ids not in the playlist are ignored.
 */
export function setPlaylistOrder(
  db: LibraryDb,
  playlistId: number,
  songIds: readonly number[],
  options?: WriteOptions,
) {
  db.transaction((tx) => {
    requirePlaylistRow(tx, playlistId);
    const entries = orderedEntries(tx, playlistId);
    const bySong = new Map(entries.map((entry) => [entry.songId, entry]));
    const listed = uniqueIds(songIds).flatMap((id) => bySong.get(id) ?? []);
    const listedIds = new Set(listed.map((entry) => entry.songId));
    const ordered = [
      ...listed,
      ...entries.filter((entry) => !listedIds.has(entry.songId)),
    ];
    if (ordered.every((entry, index) => entry.id === entries[index]?.id))
      return;
    renumber(tx, ordered);
    touchPlaylist(tx, playlistId, options);
  });
  return written(undefined, ["playlist_songs", "playlists"]);
}

/**
 * Makes a playlist hold exactly these songs in this order (an edit sheet's
 * Done): removes the ones not listed, appends the new ones, then orders them.
 */
export function setPlaylistSongs(
  db: LibraryDb,
  playlistId: number,
  songIds: readonly number[],
  options?: WriteOptions,
) {
  db.transaction((tx) => {
    const wanted = uniqueIds(songIds);
    const wantedSet = new Set(wanted);
    const current = orderedEntries(tx, playlistId).map((entry) => entry.songId);
    removeSongsFromPlaylist(
      tx,
      playlistId,
      current.filter((id) => !wantedSet.has(id)),
      options,
    );
    addSongsToPlaylist(tx, playlistId, wanted, options);
    setPlaylistOrder(tx, playlistId, wanted, options);
  });
  return written(undefined, ["playlist_songs", "playlists"]);
}

function orderedEntries(db: LibraryDb, playlistId: number) {
  return db
    .select({
      id: playlistSongs.id,
      songId: playlistSongs.songId,
      position: playlistSongs.position,
    })
    .from(playlistSongs)
    .where(eq(playlistSongs.playlistId, playlistId))
    .orderBy(asc(playlistSongs.position))
    .all();
}

/** The position that puts `songId` at `toIndex`, or null if the neighbours are too close. */
function bisect(entries: readonly Entry[], songId: number, toIndex: number) {
  const others = entries.filter((e) => e.songId !== songId);
  const index = Math.max(0, Math.min(others.length, Math.trunc(toIndex)));
  const currentIndex = entries.findIndex((e) => e.songId === songId);
  const current = entries[currentIndex]?.position;
  if (currentIndex === index) return current ?? null;
  return positionBetween(
    others[index - 1]?.position,
    others[index]?.position,
    current,
  );
}

/** A position strictly between two neighbours (either may be absent), or null if they are too close. */
function positionBetween(
  before: number | undefined,
  after: number | undefined,
  current: number | undefined,
) {
  if (before === undefined)
    return after === undefined ? (current ?? 1) : after - 1;
  if (after === undefined) return before + 1;
  if (after - before < MIN_POSITION_GAP) return null;
  const mid = (before + after) / 2;
  return mid > before && mid < after ? mid : null;
}

/**
 * Renumbers 1..n in two passes so the unique (playlist, position) index never
 * sees a collision: first below every current position, then to 1..n.
 */
function renumber(db: LibraryDb, entries: readonly Entry[]) {
  const base = Math.min(0, entries[0]?.position ?? 0) - entries.length - 1;
  entries.forEach((entry, index) => {
    db.update(playlistSongs)
      .set({ position: base - index })
      .where(eq(playlistSongs.id, entry.id))
      .run();
  });
  entries.forEach((entry, index) => {
    db.update(playlistSongs)
      .set({ position: index + 1 })
      .where(eq(playlistSongs.id, entry.id))
      .run();
  });
}
