import { eq } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import type { WriteOptions } from "./changes.ts";
import { playlists } from "../schema.ts";
import { nowFrom } from "./changes.ts";
import { LibraryError } from "./errors.ts";

export function touchPlaylist(
  db: LibraryDb,
  id: number,
  options?: WriteOptions,
) {
  db.update(playlists)
    .set({ updatedAt: nowFrom(options) })
    .where(eq(playlists.id, id))
    .run();
}

export function requirePlaylistRow(db: LibraryDb, id: number) {
  if (
    !db
      .select({ id: playlists.id })
      .from(playlists)
      .where(eq(playlists.id, id))
      .get()
  ) {
    throw new LibraryError("not-found", `No playlist ${id}`);
  }
}
