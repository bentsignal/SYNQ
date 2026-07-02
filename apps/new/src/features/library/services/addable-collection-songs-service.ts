export type AddableCollectionSong = {
  album: string;
  artist: string;
  duration: number | null;
  id: number;
  isLinked: boolean;
  title: string;
};

export type AddableCollectionSongRow = {
  albumName: string | null;
  artistName: string | null;
  duration: number | null;
  songId: number;
  title: string | null;
};

export type AddCollectionSongsCollectionKind = "album" | "artist" | "playlist";

type AddableSongAccumulator = {
  albumNames: Set<string>;
  artistNames: Set<string>;
  duration: number | null;
  id: number;
  title: string;
};

const unknownLabel = "Unknown";

const formatNames = (names: Set<string>) => {
  if (names.size === 0) {
    return unknownLabel;
  }

  return Array.from(names).sort((first, second) =>
    first.localeCompare(second),
  ).join(", ");
};

const normalizeQuery = (query?: string) => query?.trim().toLowerCase() ?? "";

const matchesQuery = (song: AddableCollectionSong, query: string) => {
  if (!query) {
    return true;
  }

  return [song.title, song.artist, song.album].some((value) =>
    value.toLowerCase().includes(query),
  );
};

export const getAddCollectionSongsUpdatedLabel = ({
  formatTime = (updatedAt) => new Date(updatedAt).toLocaleTimeString(),
  updatedAt,
}: {
  formatTime?: (updatedAt: number) => string;
  updatedAt: number;
}) =>
  updatedAt > 0
    ? `Updated ${formatTime(updatedAt)}`
    : "Waiting for library data";

export const getAddCollectionSongsBackHref = ({
  collectionId,
  kind,
}: {
  collectionId: number;
  kind: AddCollectionSongsCollectionKind;
}) => `/(tabs)/library/${kind}/${collectionId}` as const;

export const rowsToAddableCollectionSongs = ({
  linkedSongIds,
  limit = 100,
  query,
  rows,
}: {
  linkedSongIds: Set<number>;
  limit?: number;
  query?: string;
  rows: AddableCollectionSongRow[];
}) => {
  const songMap = new Map<number, AddableSongAccumulator>();
  const normalizedQuery = normalizeQuery(query);

  rows.forEach((row) => {
    const song =
      songMap.get(row.songId) ??
      {
        albumNames: new Set<string>(),
        artistNames: new Set<string>(),
        duration: row.duration,
        id: row.songId,
        title: row.title ?? "Untitled song",
      };

    if (row.albumName) {
      song.albumNames.add(row.albumName);
    }

    if (row.artistName) {
      song.artistNames.add(row.artistName);
    }

    songMap.set(row.songId, song);
  });

  return Array.from(songMap.values())
    .map<AddableCollectionSong>((song) => ({
      album: formatNames(song.albumNames),
      artist: formatNames(song.artistNames),
      duration: song.duration,
      id: song.id,
      isLinked: linkedSongIds.has(song.id),
      title: song.title,
    }))
    .filter((song) => matchesQuery(song, normalizedQuery))
    .sort((first, second) => {
      if (first.isLinked !== second.isLinked) {
        return first.isLinked ? 1 : -1;
      }

      return first.title.localeCompare(second.title, undefined, {
        sensitivity: "base",
      });
    })
    .slice(0, limit);
};
