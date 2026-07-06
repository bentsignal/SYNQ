import type {
  LibraryCollectionDetailSong,
  LibraryCollectionDetailSongRow,
} from "./library-collection-detail-song-service";
import { formatCollectionDetailNames } from "./library-collection-detail-shared-service";

type CollectionDetailSongAccumulator = {
  albumNames: Set<string>;
  artistNames: Set<string>;
  coverImage: string | null;
  duration: number | null;
  id: number;
  pathToFile: string | null;
  title: string;
  track: number | null;
};

const compareCollectionDetailSongs = (
  first: LibraryCollectionDetailSong,
  second: LibraryCollectionDetailSong,
) => {
  if (first.track !== null || second.track !== null) {
    return (
      (first.track ?? Number.MAX_SAFE_INTEGER) -
      (second.track ?? Number.MAX_SAFE_INTEGER)
    );
  }

  return first.id - second.id;
};

export const rowsToCollectionDetailSongs = (
  rows: LibraryCollectionDetailSongRow[],
) => {
  const songMap = new Map<number, CollectionDetailSongAccumulator>();

  rows.forEach((row) => {
    const song =
      songMap.get(row.songId) ??
      {
        albumNames: new Set<string>(),
        artistNames: new Set<string>(),
        coverImage: row.songCoverImage ?? row.albumCoverImage ?? null,
        duration: row.duration,
        id: row.songId,
        pathToFile: row.pathToFile,
        title: row.title ?? "Untitled song",
        track: row.track,
      };

    if (row.albumName) {
      song.albumNames.add(row.albumName);
    }

    if (row.artistName) {
      song.artistNames.add(row.artistName);
    }

    song.coverImage =
      song.coverImage ?? row.songCoverImage ?? row.albumCoverImage ?? null;

    songMap.set(row.songId, song);
  });

  return Array.from(songMap.values())
    .map<LibraryCollectionDetailSong>((song) => ({
      album: formatCollectionDetailNames(song.albumNames),
      ...(song.coverImage ? { artworkUri: song.coverImage } : {}),
      artist: formatCollectionDetailNames(song.artistNames),
      duration: song.duration,
      id: song.id,
      pathToFile: song.pathToFile,
      title: song.title,
      track: song.track,
    }))
    .sort(compareCollectionDetailSongs);
};
