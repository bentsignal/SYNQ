import {
  compareAddableCollectionSongs,
  matchesAddableCollectionSongQuery,
  normalizeAddableCollectionSongQuery,
} from "./addable-collection-songs-filter-service";
import type {
  AddableCollectionSong,
  AddableCollectionSongRow,
} from "./addable-collection-songs-types-service";

type AddableSongAccumulator = {
  albumNames: Set<string>;
  artistNames: Set<string>;
  duration: number | null;
  id: number;
  title: string;
};

const unknownLabel = "Unknown";

const formatAddableCollectionSongNames = (names: Set<string>) => {
  if (names.size === 0) {
    return unknownLabel;
  }

  return Array.from(names).sort((first, second) =>
    first.localeCompare(second),
  ).join(", ");
};

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
  const normalizedQuery = normalizeAddableCollectionSongQuery(query);

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
      album: formatAddableCollectionSongNames(song.albumNames),
      artist: formatAddableCollectionSongNames(song.artistNames),
      duration: song.duration,
      id: song.id,
      isLinked: linkedSongIds.has(song.id),
      title: song.title,
    }))
    .filter((song) =>
      matchesAddableCollectionSongQuery(song, normalizedQuery),
    )
    .sort(compareAddableCollectionSongs)
    .slice(0, limit);
};
