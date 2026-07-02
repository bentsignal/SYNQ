export type LibrarySongPreview = {
  album: string;
  artist: string;
  duration: number | null;
  id: number;
  pathToFile: string | null;
  title: string;
};

export type LibrarySongPreviewPlaybackItem = {
  album: string;
  artist: string;
  duration: number | null;
  id: number;
  pathToFile: string | null;
  title: string;
};

export type LibrarySongPreviewSort = "album" | "artist" | "recent" | "title";

export type LibrarySongPreviewOrder = "asc" | "desc";

export type LibrarySongPreviewHref =
  | "/(tabs)/import"
  | "/player"
  | `/(tabs)/library/song/${number}`;

export type LibrarySongPreviewRow = {
  albumName: string | null;
  artistName: string | null;
  duration: number | null;
  pathToFile: string | null;
  songId: number;
  title: string;
};

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

const normalizeQuery = (query?: string) => query?.trim().toLowerCase() ?? "";

const matchesQuery = (song: LibrarySongPreview, query: string) => {
  if (!query) {
    return true;
  }

  return [song.title, song.artist, song.album].some((value) =>
    value.toLowerCase().includes(query),
  );
};

const compareText = (first: string, second: string) =>
  first.localeCompare(second, undefined, { sensitivity: "base" });

const sortSongs = (
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

export const getLibrarySongPreviewRowState = ({
  activeTrackId,
  song,
}: {
  activeTrackId: number | null;
  song: LibrarySongPreview;
}) => ({
  canPlay: song.pathToFile !== null,
  isActive: activeTrackId === song.id,
});

export const getLibrarySongPreviewDetailHref = (
  song: LibrarySongPreview,
): LibrarySongPreviewHref => `/(tabs)/library/song/${song.id}`;

export const getLibrarySongPreviewPlayerHref = (): LibrarySongPreviewHref =>
  "/player";

export const getLibrarySongPreviewEmptyState = () => ({
  body: "Import audio files to start building your song library.",
  link: {
    href: "/(tabs)/import" as LibrarySongPreviewHref,
    label: "Import music",
  },
  title: "No songs yet",
});

export const getLibrarySongPreviewListState = ({
  songs,
}: {
  songs: LibrarySongPreview[];
}) => ({
  meta: `${songs.length} shown`,
  title: "Recent Songs",
});

export const getLibrarySongListControlsState = ({
  order,
  sort,
}: {
  order: LibrarySongPreviewOrder;
  sort: LibrarySongPreviewSort;
}) => ({
  nextOrder: order === "asc" ? "desc" as const : "asc" as const,
  orderLabel: order === "asc" ? "Asc" : "Desc",
  searchInput: {
    placeholder: "Search songs, artists, albums",
  },
  sortOptions: [
    {
      isActive: sort === "recent",
      label: "Recent",
      value: "recent" as const,
    },
    {
      isActive: sort === "title",
      label: "Title",
      value: "title" as const,
    },
    {
      isActive: sort === "artist",
      label: "Artist",
      value: "artist" as const,
    },
    {
      isActive: sort === "album",
      label: "Album",
      value: "album" as const,
    },
  ],
});

export const toLibrarySongPlaybackItem = (
  song: LibrarySongPreview,
): LibrarySongPreviewPlaybackItem => ({
  album: song.album,
  artist: song.artist,
  duration: song.duration,
  id: song.id,
  pathToFile: song.pathToFile,
  title: song.title,
});

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
  const normalizedQuery = normalizeQuery(query);

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
    .filter((song) => matchesQuery(song, normalizedQuery));

  return sortSongs(songs, sort, order).slice(0, limit);
};
