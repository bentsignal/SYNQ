export type LibraryCollectionDetailSong = {
  album: string;
  artist: string;
  duration: number | null;
  id: number;
  pathToFile: string | null;
  title: string;
  track: number | null;
};

export type LibraryCollectionDetailSongRow = {
  albumName: string | null;
  artistName: string | null;
  duration: number | null;
  pathToFile: string | null;
  songId: number;
  title: string | null;
  track: number | null;
};

const unknownLabel = "Unknown";

export const formatCollectionDetailNames = (names: Set<string>) => {
  if (names.size === 0) {
    return unknownLabel;
  }

  return Array.from(names).sort((first, second) =>
    first.localeCompare(second),
  ).join(", ");
};

export const rowsToCollectionDetailSongs = (
  rows: LibraryCollectionDetailSongRow[],
) => {
  const songMap = new Map<
    number,
    {
      albumNames: Set<string>;
      artistNames: Set<string>;
      duration: number | null;
      id: number;
      pathToFile: string | null;
      title: string;
      track: number | null;
    }
  >();

  rows.forEach((row) => {
    const song =
      songMap.get(row.songId) ??
      {
        albumNames: new Set<string>(),
        artistNames: new Set<string>(),
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

    songMap.set(row.songId, song);
  });

  return Array.from(songMap.values())
    .map<LibraryCollectionDetailSong>((song) => ({
      album: formatCollectionDetailNames(song.albumNames),
      artist: formatCollectionDetailNames(song.artistNames),
      duration: song.duration,
      id: song.id,
      pathToFile: song.pathToFile,
      title: song.title,
      track: song.track,
    }))
    .sort((first, second) => {
      if (first.track !== null || second.track !== null) {
        return (
          (first.track ?? Number.MAX_SAFE_INTEGER) -
          (second.track ?? Number.MAX_SAFE_INTEGER)
        );
      }

      return first.id - second.id;
    });
};
