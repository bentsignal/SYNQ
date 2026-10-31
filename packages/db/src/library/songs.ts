import { eq, inArray, max } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import { albumArtists, albums, albumSongs, playlists, playlistSongs, songArtists, songs } from "../schema.ts";
import { artworkDir, type ArtworkKind } from "./artwork.ts";
import { nowFrom, written, type LibraryTable, type WriteOptions, type WriteResult } from "./changes.ts";
import { LibraryError } from "./errors.ts";
import { EntityResolver, uniqueIds, type AlbumRef, type ArtistRef } from "./find-or-create.ts";
import { dedupeNames, splitArtistNames } from "./matching.ts";
import { loadSongItems, songSearchFields, type SongListItem } from "./song-items.ts";
import { matchesSearch, sortBy, type SortOrder } from "./text.ts";

export type SongSort = "title" | "artist" | "album" | "addedAt";

export interface ListSongsOptions {
  sort?: SongSort;
  order?: SortOrder;
  search?: string;
}

/** The whole library (2.5.2's Songs tab). Defaults to newest first, like 2.5.2. */
export function listSongs(db: LibraryDb, options: ListSongsOptions = {}): SongListItem[] {
  const items = loadSongItems(db).filter((song) => matchesSearch(options.search, songSearchFields(song)));
  return sortSongs(items, options.sort ?? "addedAt", options.order ?? "desc");
}

export function sortSongs<T extends SongListItem>(items: T[], sort: SongSort, order: SortOrder): T[] {
  switch (sort) {
    case "title":
      return sortBy(items, order, [(s) => s.title, (s) => s.id]);
    case "artist":
      return sortBy(items, order, [(s) => s.artists[0]?.name, (s) => s.title, (s) => s.id]);
    case "album":
      return sortBy(items, order, [(s) => s.albums[0]?.name, (s) => s.albums[0]?.track, (s) => s.title, (s) => s.id]);
    case "addedAt":
      return sortBy(items, order, [(s) => s.addedAt, (s) => s.id]);
  }
}

export interface SongDetail extends SongListItem {
  liked: boolean;
  /** User playlists (and Liked Songs) containing the song. */
  playlistIds: number[];
}

export function getSong(db: LibraryDb, id: number): SongDetail | null {
  const [item] = loadSongItems(db, eq(songs.id, id));
  if (!item) return null;
  const memberships = db
    .select({ id: playlists.id, kind: playlists.kind })
    .from(playlistSongs)
    .innerJoin(playlists, eq(playlists.id, playlistSongs.playlistId))
    .where(eq(playlistSongs.songId, id))
    .orderBy(playlists.id)
    .all();
  return {
    ...item,
    liked: memberships.some((p) => p.kind === "liked"),
    playlistIds: memberships.map((p) => p.id),
  };
}

/** One imported file, as the import pipeline read it. */
export interface NewSongInput {
  title: string;
  /** The file's name as imported; it becomes `library/{id}/{fileName}`. */
  fileName: string;
  mimeType?: string | null;
  durationMs: number;
  /**
   * The raw artist tag (split per the matching rules in `matching.ts`) or
   * already-separated names (used as given).
   */
  artists?: string | readonly string[] | null;
  album?: string | null;
  year?: number | null;
  track?: number | null;
  /** The file has embedded artwork the app will write after this call. */
  hasArtwork?: boolean;
}

export interface AddedSong {
  id: number;
  /** Where the app must copy the audio file, relative to `Documents/`. */
  filePath: string;
  artistIds: number[];
  albumId: number | null;
  /**
   * Where the app writes the embedded artwork, if any: the new album's folder
   * when the song has an album without artwork, else the song's own folder;
   * null when there is nothing to write (no artwork, or the album already has
   * a cover, which 2.5.2 also kept).
   */
  artworkTarget: { kind: ArtworkKind; id: number; dir: string } | null;
}

/**
 * Inserts imported songs (one transaction), finding or creating their
 * artists and album, and crediting the song's artists on the album as 2.5.2
 * did. Copy each file to `filePath` afterwards; if a copy fails, delete that
 * song with `deleteSongs`.
 */
export function addSongs(
  db: LibraryDb,
  inputs: readonly NewSongInput[],
  options?: WriteOptions,
): WriteResult<AddedSong[]> {
  const now = nowFrom(options);
  const changed = new Set<LibraryTable>(["songs"]);
  const added = db.transaction((tx): AddedSong[] => {
    const resolver = new EntityResolver(tx, now);
    const result = inputs.map((input, index): AddedSong => {
      const { id } = tx
        .insert(songs)
        .values({
          title: input.title.trim(),
          mimeType: input.mimeType || null,
          durationMs: Math.max(0, Math.round(input.durationMs)),
          // Keeps a batch in its import order under "date added".
          addedAt: now + index,
        })
        .returning({ id: songs.id })
        .get();
      const filePath = `library/${id}/${safeFileName(input.fileName, input.mimeType)}`;
      tx.update(songs).set({ filePath }).where(eq(songs.id, id)).run();

      const names =
        typeof input.artists === "string"
          ? splitArtistNames(input.artists, (name) => resolver.artistMatcher.has(name))
          : dedupeNames(input.artists ?? []);
      const artistIds = uniqueIds(names.map((name) => resolver.artist({ name })));
      if (artistIds.length > 0) {
        tx.insert(songArtists)
          .values(artistIds.map((artistId, position) => ({ songId: id, artistId, position })))
          .run();
        changed.add("song_artists");
      }

      let albumId: number | null = null;
      let artworkTarget: AddedSong["artworkTarget"] = null;
      if (input.album && input.album.trim() !== "") {
        albumId = resolver.album({ name: input.album, year: input.year ?? null });
        tx.insert(albumSongs).values({ albumId, songId: id, track: positiveOrNull(input.track), position: 0 }).run();
        appendAlbumArtists(tx, albumId, artistIds);
        changed.add("album_songs").add("album_artists");
        if (input.hasArtwork) {
          const album = tx.select({ v: albums.artworkVersion }).from(albums).where(eq(albums.id, albumId)).get();
          if (album?.v === null) {
            tx.update(albums).set({ artworkVersion: now }).where(eq(albums.id, albumId)).run();
            changed.add("albums");
            artworkTarget = { kind: "album", id: albumId, dir: artworkDir("album", albumId) };
          }
        }
      } else if (input.hasArtwork) {
        tx.update(songs).set({ artworkVersion: now }).where(eq(songs.id, id)).run();
        artworkTarget = { kind: "song", id, dir: artworkDir("song", id) };
      }
      return { id, filePath, artistIds, albumId, artworkTarget };
    });
    if (resolver.createdArtists) changed.add("artists");
    if (resolver.createdAlbums) changed.add("albums");
    return result;
  });
  return written(added, changed);
}

/** Adds artists to an album's credits (after the existing ones), skipping any already credited. */
export function appendAlbumArtists(db: LibraryDb, albumId: number, artistIds: readonly number[]): void {
  if (artistIds.length === 0) return;
  const existing = new Set(
    db.select({ id: albumArtists.artistId }).from(albumArtists).where(eq(albumArtists.albumId, albumId)).all().map((r) => r.id),
  );
  const last = db.select({ value: max(albumArtists.position) }).from(albumArtists).where(eq(albumArtists.albumId, albumId)).get();
  let position = (last?.value ?? -1) + 1;
  const rows = artistIds.filter((id) => !existing.has(id)).map((artistId) => ({ albumId, artistId, position: position++ }));
  if (rows.length > 0) db.insert(albumArtists).values(rows).run();
}

export interface EditSongInput {
  title?: string;
  /** Replaces the song's artists, in credit order. */
  artists?: readonly ArtistRef[];
  /**
   * Replaces the song's albums, in album order (the first is primary).
   * `track` undefined keeps the song's current track on that album.
   */
  albums?: readonly { album: AlbumRef; track?: number | null }[];
}

/** Edits a song's tags; marks it modified since export (its file's tags are now stale). */
export function editSong(
  db: LibraryDb,
  id: number,
  input: EditSongInput,
  options?: WriteOptions,
): WriteResult<SongListItem> {
  const now = nowFrom(options);
  const changed = new Set<LibraryTable>(["songs"]);
  db.transaction((tx) => {
    const updated = tx
      .update(songs)
      .set({ ...(input.title !== undefined && { title: input.title.trim() }), modifiedSinceExport: true })
      .where(eq(songs.id, id))
      .run().changes;
    if (updated === 0) throw new LibraryError("not-found", `No song ${id}`);
    const resolver = new EntityResolver(tx, now);

    if (input.artists) {
      const artistIds = uniqueIds(input.artists.map((ref) => resolver.artist(ref)));
      tx.delete(songArtists).where(eq(songArtists.songId, id)).run();
      if (artistIds.length > 0) {
        tx.insert(songArtists)
          .values(artistIds.map((artistId, position) => ({ songId: id, artistId, position })))
          .run();
      }
      changed.add("song_artists");
    }

    if (input.albums) {
      const previous = new Map(
        tx.select({ albumId: albumSongs.albumId, track: albumSongs.track }).from(albumSongs).where(eq(albumSongs.songId, id)).all().map((r) => [r.albumId, r.track]),
      );
      const seen = new Set<number>();
      const rows: (typeof albumSongs.$inferInsert)[] = [];
      for (const entry of input.albums) {
        const albumId = resolver.album(entry.album);
        if (seen.has(albumId)) continue;
        seen.add(albumId);
        const track = entry.track === undefined ? (previous.get(albumId) ?? null) : positiveOrNull(entry.track);
        rows.push({ albumId, songId: id, track, position: rows.length });
      }
      tx.delete(albumSongs).where(eq(albumSongs.songId, id)).run();
      if (rows.length > 0) tx.insert(albumSongs).values(rows).run();
      changed.add("album_songs");
    }
    if (resolver.createdArtists) changed.add("artists");
    if (resolver.createdAlbums) changed.add("albums");
  });
  const [item] = loadSongItems(db, eq(songs.id, id));
  if (!item) throw new LibraryError("not-found", `No song ${id}`);
  return written(item, changed);
}

/** Clears `modified_since_export` after the app wrote the tags into the files. */
export function markSongsExported(db: LibraryDb, ids: readonly number[]): WriteResult<void> {
  if (ids.length > 0) {
    db.update(songs).set({ modifiedSinceExport: false }).where(inArray(songs.id, [...ids])).run();
  }
  return written(undefined, ["songs"]);
}

export interface DeletedSongs {
  ids: number[];
  /** Folders (relative to `Documents/`) the app must delete after the commit. */
  deletePaths: string[];
}

/**
 * Deletes songs and (by cascade) their artist, album, and playlist rows.
 * Artists and albums left without songs are kept, as in 2.5.2.
 */
export function deleteSongs(db: LibraryDb, ids: readonly number[], options?: WriteOptions): WriteResult<DeletedSongs> {
  const now = nowFrom(options);
  const deleted = db.transaction((tx) => {
    const unique = uniqueIds(ids);
    if (unique.length === 0) return [];
    const affected = tx
      .selectDistinct({ id: playlistSongs.playlistId })
      .from(playlistSongs)
      .where(inArray(playlistSongs.songId, unique))
      .all()
      .map((r) => r.id);
    const rows = tx.delete(songs).where(inArray(songs.id, unique)).returning({ id: songs.id }).all();
    if (affected.length > 0) tx.update(playlists).set({ updatedAt: now }).where(inArray(playlists.id, affected)).run();
    return rows.map((r) => r.id).sort((a, b) => a - b);
  });
  return written(
    { ids: deleted, deletePaths: deleted.map((id) => artworkDir("song", id)) },
    ["songs", "song_artists", "album_songs", "playlist_songs", "playlists"],
  );
}

const mimeExtensions: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/flac": "flac",
};

/**
 * A file name that is safe as one path component. 2.5.2 built
 * `song.${mimeType}` for nameless imports, which produced `song.audio/mpeg`
 * (a subdirectory); this never emits a slash.
 */
export function safeFileName(fileName: string, mimeType?: string | null): string {
  const cleaned = fileName.normalize("NFC").replace(/[/\\\0]/g, "_").trim();
  if (cleaned !== "" && cleaned !== "." && cleaned !== "..") return cleaned;
  const extension = (mimeType && mimeExtensions[mimeType.toLowerCase()]) ?? "audio";
  return `song.${extension}`;
}

function positiveOrNull(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.trunc(value) : null;
}

