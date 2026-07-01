import { SortOrder, SortType, type SongType } from "@/src/constants/Types";

type SongQueryField = "title" | "artist" | "album";
type SongSortComparers = Partial<Record<SortType, SongSortComparer>>;
type SongSortComparer = (first: SongType, second: SongType) => number;

type SortSongResultsInput = {
  comparers: SongSortComparers;
  fallbackComparer: SongSortComparer;
  order: SortOrder;
  songs: SongType[];
  sort: SortType;
};

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

export const sortSongResults = ({
  comparers,
  fallbackComparer,
  order,
  songs,
  sort,
}: SortSongResultsInput) => {
  const comparer = comparers[sort] ?? fallbackComparer;
  const sorted = [...songs].sort(comparer);

  return order === SortOrder.DESC ? sorted.reverse() : sorted;
};
