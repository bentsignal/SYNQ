import {
  librarySongPreviewMatchesQuery,
  normalizeLibrarySongPreviewQuery,
  sortLibrarySongPreviews,
} from "./library-song-preview-list-order-service";
import type {
  LibrarySongPreview,
  LibrarySongPreviewOrder,
  LibrarySongPreviewRow,
  LibrarySongPreviewSort,
} from "./library-song-preview-types-service";

type SongPreviewAccumulator = {
  albumNames: Set<string>;
  artistNames: Set<string>;
  duration: number | null;
  pathToFile: string | null;
  songId: number;
  title: string;
};

const emptyLabel = "Unknown";

const formatNames = (names: Set<string>) => {
  if (names.size === 0) {
    return emptyLabel;
  }

  return Array.from(names).sort((first, second) =>
    first.localeCompare(second),
  ).join(", ");
};

export const rowsToSongPreviews = ({
  limit,
  order,
  query,
  rows,
  sort,
}: {
  limit: number;
  order: LibrarySongPreviewOrder;
  query?: string;
  rows: LibrarySongPreviewRow[];
  sort: LibrarySongPreviewSort;
}) => {
  const songMap = new Map<number, SongPreviewAccumulator>();
  const normalizedQuery = normalizeLibrarySongPreviewQuery(query);

  rows.forEach((row) => {
    const song =
      songMap.get(row.songId) ??
      {
        albumNames: new Set<string>(),
        artistNames: new Set<string>(),
        duration: row.duration,
        pathToFile: row.pathToFile,
        songId: row.songId,
        title: row.title,
      };

    if (row.albumName) {
      song.albumNames.add(row.albumName);
    }

    if (row.artistName) {
      song.artistNames.add(row.artistName);
    }

    songMap.set(row.songId, song);
  });

  const songs = Array.from(songMap.values())
    .map<LibrarySongPreview>((song) => ({
      album: formatNames(song.albumNames),
      artist: formatNames(song.artistNames),
      duration: song.duration,
      id: song.songId,
      pathToFile: song.pathToFile,
      title: song.title,
    }))
    .filter((song) => librarySongPreviewMatchesQuery(song, normalizedQuery));

  return sortLibrarySongPreviews(songs, sort, order).slice(0, limit);
};
