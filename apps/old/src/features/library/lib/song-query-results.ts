import type { SongType } from "@/src/constants/Types";

type SongQueryField = "title" | "artist" | "album";

export const normalizeLibraryQuery = (query?: string) =>
  query?.trim().toLowerCase() ?? "";

export const compareLibraryText = (first?: string, second?: string) =>
  (first ?? "").localeCompare(second ?? "");

export const compareOptionalTrack = (first?: number, second?: number) => {
  if (!first) {
    return 1;
  }

  if (!second) {
    return -1;
  }

  return first - second;
};

export const matchesSongQuery = (
  song: SongType,
  query: string,
  fields: SongQueryField[] = ["title", "artist", "album"],
) => {
  if (!query) {
    return true;
  }

  return fields.some((field) => song[field]?.toLowerCase().includes(query));
};
