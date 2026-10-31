import type { LibraryDb } from "@synq/db";
import {
  findLikedPlaylistId,
  getAlbum,
  getArtist,
  getPlaylist,
} from "@synq/db";

import type { PlaybackSource } from "./types";
import { useLibraryQuery } from "~/features/library/queries";

const FIXED_NAMES = { library: "Library", search: "Search" } as const;

function entityName(db: LibraryDb, source: PlaybackSource) {
  switch (source.kind) {
    case "library":
    case "search":
      return FIXED_NAMES[source.kind];
    case "liked":
      return likedName(db);
    case "playlist":
      return getPlaylist(db, source.id)?.name;
    case "album":
      return getAlbum(db, source.id)?.name;
    case "artist":
      return getArtist(db, source.id)?.name;
  }
}

function likedName(db: LibraryDb) {
  const id = findLikedPlaylistId(db);
  return id === null ? undefined : getPlaylist(db, id)?.name;
}

/** What "Playing from …" names; null when there's none or it was deleted. */
function sourceName(db: LibraryDb, source: PlaybackSource | null) {
  return source === null ? null : (entityName(db, source) ?? null);
}

/** The queue source's name (a library query, so a rename shows). */
export function useSourceName(source: PlaybackSource | null) {
  return useLibraryQuery({
    key: ["player", "source", source],
    read: (db) => sourceName(db, source),
    select: (name) => name,
  });
}
