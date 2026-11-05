import type { LibraryDb } from "@synq/db";
import { createArtist } from "@synq/db";

/**
 * An artist or album to pick: an existing one by id, or a new one by name. An
 * album says whether it has a cover, so a song's sheet can show the one it'll use.
 */
export type Pick =
  | { id: number; name: string; artworkVersion?: number | null }
  | { name: string };

export function pickKey(pick: Pick) {
  return "id" in pick ? `id:${pick.id}` : `name:${pick.name.toLowerCase()}`;
}

/** Artist ids for picks, creating the new ones (inside the album's write). */
export function artistIds(db: LibraryDb, picks: readonly Pick[]) {
  return picks.map((pick) =>
    "id" in pick ? pick.id : createArtist(db, pick.name).value.id,
  );
}
