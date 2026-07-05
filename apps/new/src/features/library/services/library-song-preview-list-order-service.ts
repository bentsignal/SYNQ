import type {
  LibrarySongPreview,
  LibrarySongPreviewOrder,
  LibrarySongPreviewSort,
} from "./library-song-preview-types-service";

const compareText = (first: string, second: string) =>
  first.localeCompare(second, undefined, { sensitivity: "base" });

export const normalizeLibrarySongPreviewQuery = (query?: string) =>
  query?.trim().toLowerCase() ?? "";

export const librarySongPreviewMatchesQuery = (
  song: LibrarySongPreview,
  query: string,
) => {
  if (!query) {
    return true;
  }

  return [song.title, song.artist, song.album].some((value) =>
    value.toLowerCase().includes(query),
  );
};

export const sortLibrarySongPreviews = (
  songs: LibrarySongPreview[],
  sort: LibrarySongPreviewSort,
  order: LibrarySongPreviewOrder,
) => {
  const sorted = [...songs].sort((first, second) => {
    switch (sort) {
      case "album":
        return compareText(first.album, second.album) || second.id - first.id;
      case "artist":
        return compareText(first.artist, second.artist) || second.id - first.id;
      case "title":
        return compareText(first.title, second.title) || second.id - first.id;
      case "recent":
      default:
        return second.id - first.id;
    }
  });

  return order === "asc" ? sorted.reverse() : sorted;
};
