/**
 * Artist and album references in writes: either an existing id or a name to
 * find or create (so a form can mix picked and newly typed artists).
 */
import { asc, eq } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import type { AlbumCandidate } from "./album-identity.ts";
import { albumArtists, albums, albumSongs, artists } from "../schema.ts";
import { LibraryError } from "./errors.ts";
import { NameMatcher } from "./matching.ts";
import { cleanName, nameKey } from "./text.ts";

export type ArtistRef = { id: number } | { name: string };
export type AlbumRef = { id: number } | { name: string; year?: number | null };

/** Finds or creates artists and albums by name within one transaction. */
export class EntityResolver {
  readonly #db: LibraryDb;
  readonly #now: number;
  #artists: NameMatcher<{ id: number; name: string }> | undefined;
  #albums: NameMatcher<{ id: number; name: string }> | undefined;
  /** Whether this resolver inserted any artist or album rows. */
  createdArtists = false;
  createdAlbums = false;

  constructor(db: LibraryDb, now: number) {
    this.#db = db;
    this.#now = now;
  }

  get artistMatcher() {
    this.#artists ??= new NameMatcher(
      this.#db
        .select({ id: artists.id, name: artists.name })
        .from(artists)
        .all(),
    );
    return this.#artists;
  }

  get albumMatcher() {
    this.#albums ??= new NameMatcher(
      this.#db.select({ id: albums.id, name: albums.name }).from(albums).all(),
    );
    return this.#albums;
  }

  artist(ref: ArtistRef): number {
    if ("id" in ref) {
      const row = this.#db
        .select({ id: artists.id })
        .from(artists)
        .where(eq(artists.id, ref.id))
        .get();
      if (!row) throw new LibraryError("not-found", `No artist ${ref.id}`);
      return row.id;
    }
    const name = requireName(ref.name, "Artist");
    const existing = this.artistMatcher.find(name);
    if (existing) return existing.id;
    const { id } = this.#db
      .insert(artists)
      .values({ name, addedAt: this.#now })
      .returning({ id: artists.id })
      .get();
    this.artistMatcher.add({ id, name });
    this.createdArtists = true;
    return id;
  }

  /** An album that must already exist. */
  existingAlbum(id: number): number {
    const row = this.#db
      .select({ id: albums.id })
      .from(albums)
      .where(eq(albums.id, id))
      .get();
    if (!row) throw new LibraryError("not-found", `No album ${id}`);
    return row.id;
  }

  /** Every album of this name, as `album-identity.ts` needs to choose between them. */
  albumCandidates(
    name: string,
    open: ReadonlySet<number> = new Set(),
  ): AlbumCandidate[] {
    const exact = cleanName(name);
    return this.albumMatcher.all(name).map((row) => ({
      artistIds: this.#db
        .select({ id: albumArtists.artistId })
        .from(albumArtists)
        .where(eq(albumArtists.albumId, row.id))
        .orderBy(asc(albumArtists.position))
        .all()
        .map((credit) => credit.id),
      exactName: cleanName(row.name) === exact,
      id: row.id,
      open: open.has(row.id),
      tracks: this.#db
        .select({ track: albumSongs.track })
        .from(albumSongs)
        .where(eq(albumSongs.albumId, row.id))
        .all()
        .map((song) => song.track),
    }));
  }

  /** A new album row, even if others have its name. */
  createAlbum(rawName: string, year: number | null | undefined): number {
    const name = requireName(rawName, "Album");
    const { id } = this.#db
      .insert(albums)
      .values({ name, year: year ?? null, addedAt: this.#now })
      .returning({ id: albums.id })
      .get();
    this.albumMatcher.add({ id, name });
    this.createdAlbums = true;
    return id;
  }
}

export function requireName(name: string, what: string) {
  const cleaned = cleanName(name);
  if (cleaned === "")
    throw new LibraryError("empty-name", `${what} name is required`);
  return cleaned;
}

export function uniqueIds(ids: readonly number[]) {
  return [...new Set(ids)];
}

/**
 * Name uniqueness for user-created artists, albums, and playlists: no two
 * names may match ignoring case. Legacy case-variant duplicates already exist,
 * so a row keeping its own name (or changing only its case) conflicts only
 * with an exact duplicate, never with its variant.
 */
export function assertUniqueName(
  others: readonly { name: string }[],
  name: string,
  currentName: string | null,
  what: string,
) {
  const key = nameKey(name);
  const caseOnly = currentName !== null && nameKey(currentName) === key;
  const conflict = others.some(
    (other) =>
      nameKey(other.name) === key &&
      (!caseOnly || cleanName(other.name) === cleanName(name)),
  );
  if (conflict)
    throw new LibraryError(
      "duplicate-name",
      `${what} named "${name}" already exists`,
    );
}
