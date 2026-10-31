import { useSyncExternalStore } from "react";

import type { SortOrder } from "@synq/db";

import { readJson, writeJson } from "~/lib/kv";

const STORAGE_KEY = "synq.library-sort";

/** Saved sorts by scope: a list (`songs`) or one playlist (`playlist:12`). */
let saved = readJson(STORAGE_KEY, (stored) =>
  typeof stored === "object" && stored !== null
    ? new Map<string, unknown>(Object.entries(stored))
    : new Map<string, unknown>(),
);
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export interface Sort<Key extends string> {
  key: Key;
  order: SortOrder;
}

/**
 * One list's sort, kept across launches: its keys (labels in menu order)
 * and the sort it starts with. Lists that are many (playlists) keep one
 * per id.
 */
function sortStore<Key extends string>(
  scope: string,
  keys: readonly { label: string; value: Key }[],
  initial: Sort<Key>,
) {
  function isKey(value: unknown): value is Key {
    return keys.some((option) => option.value === value);
  }
  function scopeOf(id: number | undefined) {
    return id === undefined ? scope : `${scope}:${id}`;
  }
  function decode(stored: unknown) {
    if (typeof stored !== "object" || stored === null) return initial;
    const key = "key" in stored && isKey(stored.key) ? stored.key : initial.key;
    const order =
      "order" in stored && (stored.order === "asc" || stored.order === "desc")
        ? stored.order
        : initial.order;
    return { key, order } satisfies Sort<Key>;
  }
  return {
    initial,
    keys,
    set(next: Sort<Key>, id?: number) {
      saved = new Map(saved).set(scopeOf(id), next);
      writeJson(STORAGE_KEY, Object.fromEntries(saved));
      for (const listener of listeners) listener();
    },
    /** The current sort (pass a playlist's id for its own). */
    use(id?: number) {
      return decode(
        useSyncExternalStore(subscribe, () => saved.get(scopeOf(id))),
      );
    },
  };
}

export interface SortStore<Key extends string> {
  initial: Sort<Key>;
  keys: readonly { label: string; value: Key }[];
  set: (next: Sort<Key>, id?: number) => void;
  use: (id?: number) => Sort<Key>;
}

/** The sorts of docs/ui.md (Songs, Albums, Artists, Playlists), and 2.5.2's defaults. */
export const songSort = sortStore(
  "songs",
  [
    { label: "Title", value: "title" },
    { label: "Artist", value: "artist" },
    { label: "Album", value: "album" },
    { label: "Date Added", value: "addedAt" },
  ],
  { key: "addedAt", order: "desc" },
);

export const albumSort = sortStore(
  "albums",
  [
    { label: "Name", value: "name" },
    { label: "Year", value: "year" },
    { label: "Artist", value: "artist" },
  ],
  { key: "name", order: "asc" },
);

export const artistSort = sortStore(
  "artists",
  [{ label: "Name", value: "name" }],
  { key: "name", order: "asc" },
);

export const playlistsSort = sortStore(
  "playlists",
  [
    { label: "Name", value: "name" },
    { label: "Date Added", value: "createdAt" },
  ],
  { key: "createdAt", order: "desc" },
);

/** A playlist's songs (each playlist keeps its own). */
export const playlistSongSort = sortStore(
  "playlist",
  [
    { label: "Playlist Order", value: "position" },
    { label: "Title", value: "title" },
    { label: "Artist", value: "artist" },
    { label: "Album", value: "album" },
    { label: "Date Added", value: "addedAt" },
  ],
  { key: "position", order: "asc" },
);
