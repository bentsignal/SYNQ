/**
 * What New Album and Edit Album refuse: another album that is this one, by
 * `isSameAlbumIdentity`. A shared name alone is fine (docs/rewrite.md →
 * Same-named albums). An edit changing neither name nor artists is never
 * refused, so a legacy duplicate can still have its year or cover changed.
 */
import { asc, eq, ne } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import { albumArtists, albums } from "../schema.ts";
import { isSameAlbumIdentity } from "./album-identity.ts";
import { assertUniqueName } from "./find-or-create.ts";
import { nameKey } from "./text.ts";

function albumArtistIds(db: LibraryDb, albumId: number) {
  return db
    .select({ id: albumArtists.artistId })
    .from(albumArtists)
    .where(eq(albumArtists.albumId, albumId))
    .orderBy(asc(albumArtists.position))
    .all()
    .map((row) => row.id);
}

/** Refuses an album that another already is: the same name, by the same artists. */
export function assertUniqueAlbum(
  db: LibraryDb,
  album: {
    name: string;
    artistIds: readonly number[];
    exceptId: number | undefined;
    currentName: string | null;
  },
) {
  const others = db
    .select({ id: albums.id, name: albums.name })
    .from(albums)
    .where(
      album.exceptId === undefined ? undefined : ne(albums.id, album.exceptId),
    )
    .all()
    .filter(
      (other) =>
        nameKey(other.name) === nameKey(album.name) &&
        isSameAlbumIdentity(albumArtistIds(db, other.id), album.artistIds),
    );
  assertUniqueName(others, album.name, album.currentName, "An album");
}

export function assertAlbumEditAllowed(
  db: LibraryDb,
  edit: {
    id: number;
    currentName: string;
    /** Undefined when the edit leaves it alone. */
    name: string | undefined;
    artistIds: readonly number[] | undefined;
  },
) {
  const currentArtists = albumArtistIds(db, edit.id);
  const name = edit.name ?? edit.currentName;
  const artistIds = edit.artistIds ?? currentArtists;
  const unchanged =
    name === edit.currentName &&
    artistIds.length === currentArtists.length &&
    artistIds.every((artistId, index) => artistId === currentArtists[index]);
  if (unchanged) return;
  assertUniqueAlbum(db, {
    artistIds,
    currentName: edit.currentName,
    exceptId: edit.id,
    name,
  });
}
