/**
 * Artwork lives on disk where 2.5.2 put it (`cover_full.jpg`, at most 1500 px,
 * and `cover_small.jpg`, at most 200 px); the database only records whether an
 * entity has artwork and a version that changes whenever the files do, so
 * `expo-image` never shows a cached old cover.
 */
import { eq, inArray } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import { albums, albumSongs, artists, playlists, songs } from "../schema.ts";
import { nowFrom, written, type LibraryTable, type WriteOptions, type WriteResult } from "./changes.ts";
import { LibraryError } from "./errors.ts";

export type ArtworkKind = "song" | "album" | "artist" | "playlist";
export type ArtworkSize = "full" | "small";

export interface ArtworkRef {
  kind: ArtworkKind;
  id: number;
  version: number;
}

const folders: Record<ArtworkKind, string> = {
  song: "library",
  album: "albums",
  artist: "artists",
  playlist: "playlists",
};

/** The entity's folder relative to `Documents/`, e.g. `albums/12`. */
export function artworkDir(kind: ArtworkKind, id: number): string {
  return `${folders[kind]}/${id}`;
}

/** e.g. `albums/12/cover_small.jpg`, relative to `Documents/`. */
export function artworkPath(ref: Pick<ArtworkRef, "kind" | "id">, size: ArtworkSize): string {
  return `${artworkDir(ref.kind, ref.id)}/cover_${size}.jpg`;
}

/**
 * A cache-busted URI for `expo-image`: `documentsUri` is `Paths.document.uri`
 * (with its trailing slash).
 */
export function artworkUri(documentsUri: string, ref: ArtworkRef, size: ArtworkSize): string {
  return `${documentsUri}${artworkPath(ref, size)}?v=${ref.version}`;
}

export function artworkRef(kind: ArtworkKind, id: number, version: number | null): ArtworkRef | null {
  return version === null ? null : { kind, id, version };
}

export interface SetArtworkResult {
  artwork: ArtworkRef | null;
  /** Where the app writes (or deleted) `cover_full.jpg` and `cover_small.jpg`. */
  dir: string;
}

/**
 * Records that an entity's cover files were just written (`present: true`) or
 * removed. Call it after the files are in place. Album and song artwork is
 * embedded on export, so their songs become `modified_since_export` (as in
 * 2.5.2).
 */
export function setArtwork(
  db: LibraryDb,
  kind: ArtworkKind,
  id: number,
  present: boolean,
  options?: WriteOptions,
): WriteResult<SetArtworkResult> {
  const version = present ? nowFrom(options) : null;
  const changed: LibraryTable[] = [];
  db.transaction((tx) => {
    let updated = 0;
    if (kind === "song") {
      updated = tx
        .update(songs)
        .set({ artworkVersion: version, modifiedSinceExport: true })
        .where(eq(songs.id, id))
        .run().changes;
      changed.push("songs");
    } else if (kind === "album") {
      updated = tx.update(albums).set({ artworkVersion: version }).where(eq(albums.id, id)).run().changes;
      const albumSongIds = tx.select({ id: albumSongs.songId }).from(albumSongs).where(eq(albumSongs.albumId, id));
      tx.update(songs).set({ modifiedSinceExport: true }).where(inArray(songs.id, albumSongIds)).run();
      changed.push("albums", "songs");
    } else if (kind === "artist") {
      updated = tx.update(artists).set({ artworkVersion: version }).where(eq(artists.id, id)).run().changes;
      changed.push("artists");
    } else {
      updated = tx
        .update(playlists)
        .set({ artworkVersion: version, updatedAt: nowFrom(options) })
        .where(eq(playlists.id, id))
        .run().changes;
      changed.push("playlists");
    }
    if (updated === 0) throw new LibraryError("not-found", `No ${kind} ${id}`);
  });
  return written({ artwork: artworkRef(kind, id, version), dir: artworkDir(kind, id) }, changed);
}
