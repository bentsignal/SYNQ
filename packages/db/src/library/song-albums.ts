/**
 * Where a song goes when it's added or edited: which album, and who that credits.
 * `album-identity.ts` has the rule; this applies it to the database.
 */
import { asc, eq, max } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import type { LibraryTable } from "./changes.ts";
import type { AlbumRef, EntityResolver } from "./find-or-create.ts";
import type { NewSongInput } from "./song-writes.ts";
import { albumArtists, albums, albumSongs, songArtists } from "../schema.ts";
import {
  chooseAlbum,
  chooseAlbumForEdit,
  VARIOUS_ARTISTS,
} from "./album-identity.ts";
import { artworkDir } from "./artwork.ts";
import { uniqueIds } from "./find-or-create.ts";
import { dedupeNames, splitArtistNames } from "./matching.ts";

/** What one write transaction shares: its handle, the entity matcher, and the tables touched so far. */
export interface WriteContext {
  tx: LibraryDb;
  resolver: EntityResolver;
  changed: Set<LibraryTable>;
  now: number;
}

/** Artist ids for a raw tag or separated names, creating any that are new. */
export function artistIdsFor(
  resolver: EntityResolver,
  artists: string | readonly string[] | null | undefined,
) {
  const names =
    typeof artists === "string"
      ? splitArtistNames(artists, (name) => resolver.artistMatcher.has(name))
      : dedupeNames(artists ?? []);
  return uniqueIds(names.map((name) => resolver.artist({ name })));
}

/** The ids its album artist tag names; a compilation without one is by Various Artists. */
function albumArtistIdsFor(resolver: EntityResolver, input: NewSongInput) {
  const tagged = artistIdsFor(resolver, input.albumArtists);
  if (tagged.length > 0 || input.compilation !== true) return tagged;
  return [resolver.artist({ name: VARIOUS_ARTISTS })];
}

/**
 * Adds the song to its album, finding or creating it, with its credits; the
 * album takes the song's embedded cover if it has none.
 */
export function placeOnAlbum(
  context: WriteContext,
  placement: {
    songId: number;
    albumName: string;
    artistIds: number[];
    input: NewSongInput;
    openAlbums: Set<number>;
  },
) {
  const { tx, resolver, changed } = context;
  const { songId, albumName, artistIds, input, openAlbums } = placement;
  const albumArtistIds = albumArtistIdsFor(resolver, input);
  const choice = chooseAlbum(resolver.albumCandidates(albumName, openAlbums), {
    albumArtistIds,
    artistIds,
    track: positiveOrNull(input.track),
  });
  const albumId =
    choice?.album.id ?? resolver.createAlbum(albumName, input.year);
  if (choice === null && albumArtistIds.length === 0) openAlbums.add(albumId);
  tx.insert(albumSongs)
    .values({
      albumId,
      songId,
      track: positiveOrNull(input.track),
      position: 0,
    })
    .run();
  if (choice === null || choice.credit) {
    appendAlbumArtists(
      tx,
      albumId,
      albumArtistIds.length > 0 ? albumArtistIds : artistIds,
    );
  }
  changed.add("album_songs").add("album_artists");
  const artworkTarget = input.hasArtwork ? coverTarget(context, albumId) : null;
  return { albumId, artworkTarget };
}

/** Claims the album's cover for this song's artwork, if it has none. */
function coverTarget(context: WriteContext, albumId: number) {
  const { tx, changed, now } = context;
  const album = tx
    .select({ v: albums.artworkVersion })
    .from(albums)
    .where(eq(albums.id, albumId))
    .get();
  if (album?.v !== null) return null;
  tx.update(albums)
    .set({ artworkVersion: now })
    .where(eq(albums.id, albumId))
    .run();
  changed.add("albums");
  return {
    kind: "album" as const,
    id: albumId,
    dir: artworkDir("album", albumId),
  };
}

/** Adds artists to an album's credits (after the existing ones), skipping any already credited. */
export function appendAlbumArtists(
  db: LibraryDb,
  albumId: number,
  artistIds: readonly number[],
) {
  if (artistIds.length === 0) return;
  const existing = new Set(
    db
      .select({ id: albumArtists.artistId })
      .from(albumArtists)
      .where(eq(albumArtists.albumId, albumId))
      .all()
      .map((r) => r.id),
  );
  const last = db
    .select({ value: max(albumArtists.position) })
    .from(albumArtists)
    .where(eq(albumArtists.albumId, albumId))
    .get();
  let position = (last?.value ?? -1) + 1;
  const rows = artistIds
    .filter((id) => !existing.has(id))
    .map((artistId) => ({ albumId, artistId, position: position++ }));
  if (rows.length > 0) db.insert(albumArtists).values(rows).run();
}

/**
 * The album a song's edit names: an existing one by id, or by name the one
 * its artists are on, or else a new one, credited to them, so it can be told
 * from any other of that name.
 */
export function albumForEdit(context: WriteContext, id: number, ref: AlbumRef) {
  const { tx, resolver } = context;
  if ("id" in ref) return resolver.existingAlbum(ref.id);
  const artistIds = tx
    .select({ id: songArtists.artistId })
    .from(songArtists)
    .where(eq(songArtists.songId, id))
    .orderBy(asc(songArtists.position))
    .all()
    .map((row) => row.id);
  const found = chooseAlbumForEdit(
    resolver.albumCandidates(ref.name),
    artistIds,
  );
  const albumId = found?.id ?? resolver.createAlbum(ref.name, ref.year);
  if (found === null || found.artistIds.length === 0) {
    appendAlbumArtists(tx, albumId, artistIds);
    context.changed.add("album_artists");
  }
  return albumId;
}

export function positiveOrNull(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.trunc(value)
    : null;
}
