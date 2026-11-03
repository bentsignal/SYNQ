import { eq } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import type { ArtworkKind } from "./artwork.ts";
import type { LibraryTable, WriteOptions } from "./changes.ts";
import type { AlbumRef, ArtistRef } from "./find-or-create.ts";
import type { WriteContext } from "./song-albums.ts";
import { albumSongs, songArtists, songs } from "../schema.ts";
import { artworkDir } from "./artwork.ts";
import { changesOf, nowFrom, written } from "./changes.ts";
import { LibraryError } from "./errors.ts";
import { EntityResolver, uniqueIds } from "./find-or-create.ts";
import {
  albumForEdit,
  artistIdsFor,
  placeOnAlbum,
  positiveOrNull,
} from "./song-albums.ts";
import { safeFileName } from "./song-files.ts";
import { loadSongItems } from "./song-items.ts";

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
  /**
   * The raw album artist tag, split like `artists`. It says whose album this
   * is: see `album-identity.ts`.
   */
  albumArtists?: string | null;
  /** The file says it's part of a compilation (and it may name no album artist). */
  compilation?: boolean;
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

export interface AddSongsOptions extends WriteOptions {
  /**
   * Albums that same-named songs without an album artist can still join. An
   * import keeps one across a batch, whose songs are added one at a time;
   * otherwise each call is its own batch. Gains the albums created here.
   */
  openAlbums?: Set<number>;
}

/**
 * Inserts imported songs (one transaction), finding or creating their
 * artists and album (`album-identity.ts`). The album credits its album
 * artists, or without any its songs' artists, as 2.5.2 did. Copy each file to
 * `filePath` afterwards; if a copy fails, delete that song with `deleteSongs`.
 */
export function addSongs(
  db: LibraryDb,
  inputs: readonly NewSongInput[],
  options?: AddSongsOptions,
) {
  const now = nowFrom(options);
  const changed = new Set<LibraryTable>(["songs"]);
  const openAlbums = options?.openAlbums ?? new Set<number>();
  const added = db.transaction((tx): AddedSong[] => {
    const context = { tx, resolver: new EntityResolver(tx, now), changed, now };
    const result = inputs.map((input, index) =>
      insertSong(context, input, index, openAlbums),
    );
    if (context.resolver.createdArtists) changed.add("artists");
    if (context.resolver.createdAlbums) changed.add("albums");
    return result;
  });
  return written(added, changed);
}

function insertSong(
  context: WriteContext,
  input: NewSongInput,
  index: number,
  openAlbums: Set<number>,
) {
  const { tx, now } = context;
  const { id } = tx
    .insert(songs)
    .values({
      title: input.title.trim(),
      mimeType: (input.mimeType ?? "") || null,
      durationMs: Math.max(0, Math.round(input.durationMs)),
      // Keeps a batch in its import order under "date added".
      addedAt: now + index,
    })
    .returning({ id: songs.id })
    .get();
  const filePath = `library/${id}/${safeFileName(input.fileName, input.mimeType)}`;
  tx.update(songs).set({ filePath }).where(eq(songs.id, id)).run();

  const artistIds = creditArtists(context, id, input);
  if (input.album && input.album.trim() !== "") {
    const { albumId, artworkTarget } = placeOnAlbum(context, {
      songId: id,
      albumName: input.album,
      artistIds,
      input,
      openAlbums,
    });
    return { id, filePath, artistIds, albumId, artworkTarget };
  }
  let artworkTarget = null;
  if (input.hasArtwork) {
    tx.update(songs).set({ artworkVersion: now }).where(eq(songs.id, id)).run();
    artworkTarget = {
      kind: "song" as const,
      id,
      dir: artworkDir("song", id),
    };
  }
  return { id, filePath, artistIds, albumId: null, artworkTarget };
}

function creditArtists(context: WriteContext, id: number, input: NewSongInput) {
  const { tx, resolver, changed } = context;
  const artistIds = artistIdsFor(resolver, input.artists);
  if (artistIds.length > 0) {
    tx.insert(songArtists)
      .values(
        artistIds.map((artistId, position) => ({
          songId: id,
          artistId,
          position,
        })),
      )
      .run();
    changed.add("song_artists");
  }
  return artistIds;
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
) {
  const now = nowFrom(options);
  const changed = new Set<LibraryTable>(["songs"]);
  db.transaction((tx) => {
    const updated = changesOf(
      tx
        .update(songs)
        .set({
          ...(input.title !== undefined && { title: input.title.trim() }),
          modifiedSinceExport: true,
        })
        .where(eq(songs.id, id))
        .run(),
    );
    if (updated === 0) throw new LibraryError("not-found", `No song ${id}`);
    const context = { tx, resolver: new EntityResolver(tx, now), changed, now };

    if (input.artists) replaceArtists(context, id, input.artists);
    if (input.albums) replaceAlbums(context, id, input.albums);
    if (context.resolver.createdArtists) changed.add("artists");
    if (context.resolver.createdAlbums) changed.add("albums");
  });
  const [item] = loadSongItems(db, eq(songs.id, id));
  if (!item) throw new LibraryError("not-found", `No song ${id}`);
  return written(item, changed);
}

function replaceArtists(
  context: WriteContext,
  id: number,
  refs: readonly ArtistRef[],
) {
  const { tx, resolver, changed } = context;
  const artistIds = uniqueIds(refs.map((ref) => resolver.artist(ref)));
  tx.delete(songArtists).where(eq(songArtists.songId, id)).run();
  if (artistIds.length > 0) {
    tx.insert(songArtists)
      .values(
        artistIds.map((artistId, position) => ({
          songId: id,
          artistId,
          position,
        })),
      )
      .run();
  }
  changed.add("song_artists");
}

function replaceAlbums(
  context: WriteContext,
  id: number,
  entries: NonNullable<EditSongInput["albums"]>,
) {
  const { tx, changed } = context;
  const previous = new Map(
    tx
      .select({ albumId: albumSongs.albumId, track: albumSongs.track })
      .from(albumSongs)
      .where(eq(albumSongs.songId, id))
      .all()
      .map((r) => [r.albumId, r.track]),
  );
  const seen = new Set<number>();
  const rows = [];
  for (const entry of entries) {
    const albumId = albumForEdit(context, id, entry.album);
    if (seen.has(albumId)) continue;
    seen.add(albumId);
    const track =
      entry.track === undefined
        ? (previous.get(albumId) ?? null)
        : positiveOrNull(entry.track);
    rows.push({ albumId, songId: id, track, position: rows.length });
  }
  tx.delete(albumSongs).where(eq(albumSongs.songId, id)).run();
  if (rows.length > 0) tx.insert(albumSongs).values(rows).run();
  changed.add("album_songs");
}

export { appendAlbumArtists } from "./song-albums.ts";
