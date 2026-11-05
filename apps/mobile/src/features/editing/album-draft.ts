import type { Href } from "expo-router";

import type { SongListItem } from "@synq/db";

import type { ArtworkChange } from "./artwork-change";
import type { Pick } from "./pick";
import type { ReorderRow } from "./reorder-list";
import { names } from "~/features/library/format";
import { createDraft } from "./draft";

/** What New Album and Edit Album's screens share until Done saves it. */
export interface AlbumDraft {
  name: string;
  year: string;
  artists: readonly Pick[];
  artwork: ArtworkChange;
  /** The tracks in their new order, with added songs and without removed ones. */
  tracks: readonly ReorderRow[];
  /** Where this sheet's lists live. */
  routes: AlbumRoutes;
}

interface AlbumRoutes {
  artists: Href;
  songs: Href;
  addSongs: Href;
}

export const NEW_ALBUM_ROUTES = {
  addSongs: "/new-album/add-songs",
  artists: "/new-album/artists",
  songs: "/new-album/songs",
} satisfies AlbumRoutes;

export function editRoutes(id: number) {
  const params = { id: String(id) };
  return {
    addSongs: { params, pathname: "/edit-album/[id]/add-songs" },
    artists: { params, pathname: "/edit-album/[id]/artists" },
    songs: { params, pathname: "/edit-album/[id]/tracks" },
  } satisfies AlbumRoutes;
}

export const draft = createDraft<AlbumDraft>("album");

export function toRow(song: SongListItem) {
  return {
    artwork: song.artwork,
    key: String(song.id),
    subtitle: names(song.artists),
    title: song.title,
  } satisfies ReorderRow;
}

/** A year as typed, or null when the field is empty or not a year. */
export function parseYear(text: string) {
  const year = Number.parseInt(text.trim(), 10);
  return Number.isInteger(year) && year > 0 && year < 10_000 ? year : null;
}

export function trackIds(edits: AlbumDraft) {
  return edits.tracks.map((row) => Number(row.key));
}

/**
 * An album with no cover takes its first added track's, as an import gives a
 * new album its first song's. Choosing or removing a cover in the sheet wins.
 */
export function coverFromTracks(
  edits: { artwork: ArtworkChange; tracks: readonly ReorderRow[] },
  hasCover: boolean,
  saved: ReadonlySet<string>,
) {
  if (hasCover || edits.artwork.kind !== "keep") return null;
  return (
    edits.tracks.find((row) => !saved.has(row.key) && row.artwork !== null)
      ?.artwork ?? null
  );
}
