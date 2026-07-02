export type LibraryCollectionDetailKind = "album" | "artist" | "playlist";

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

export type LibraryCollectionDetail = {
  detail: string;
  eyebrow: string;
  imagePath: string | null;
  isMissing: boolean;
  kind: LibraryCollectionDetailKind;
  meta: string;
  songs: LibraryCollectionDetailSong[];
  title: string;
  updatedAt: number;
};

export type PlaylistDetailRow = {
  coverImage: string | null;
  name: string | null;
};

export type AlbumDetailRow = {
  artistName: string | null;
  coverImage: string | null;
  name: string | null;
  year: number | null;
};

export type ArtistDetailRow = {
  albumId: number | null;
  name: string | null;
  profileImage: string | null;
};

export type CollectionImagePathResolver = (imageHash: string) => string | null;

const unknownLabel = "Unknown";

const formatCount = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

const formatNames = (names: Set<string>) => {
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
      album: formatNames(song.albumNames),
      artist: formatNames(song.artistNames),
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

export const buildPlaylistDetail = ({
  getImagePath,
  playlistRows,
  songRows,
  updatedAt,
}: {
  getImagePath?: CollectionImagePathResolver;
  playlistRows: PlaylistDetailRow[];
  songRows: LibraryCollectionDetailSongRow[];
  updatedAt: number;
}): LibraryCollectionDetail => {
  const songs = rowsToCollectionDetailSongs(songRows);
  const playlist = playlistRows[0];

  return {
    detail: formatCount(songs.length, "song"),
    eyebrow: "Playlist",
    imagePath: playlist?.coverImage
      ? getImagePath?.(playlist.coverImage) ?? null
      : null,
    isMissing: !playlist,
    kind: "playlist",
    meta: "Manual collection",
    songs,
    title: playlist?.name ?? "Playlist not found",
    updatedAt,
  };
};

export const buildAlbumDetail = ({
  albumRows,
  getImagePath,
  songRows,
  updatedAt,
}: {
  albumRows: AlbumDetailRow[];
  getImagePath?: CollectionImagePathResolver;
  songRows: LibraryCollectionDetailSongRow[];
  updatedAt: number;
}): LibraryCollectionDetail => {
  const artists = new Set<string>();
  albumRows.forEach((row) => {
    if (row.artistName) {
      artists.add(row.artistName);
    }
  });

  const album = albumRows[0];
  const songs = rowsToCollectionDetailSongs(songRows);
  const artistLabel = formatNames(artists);

  return {
    detail: formatCount(songs.length, "song"),
    eyebrow: "Album",
    imagePath: album?.coverImage
      ? getImagePath?.(album.coverImage) ?? null
      : null,
    isMissing: !album,
    kind: "album",
    meta: album?.year ? `${artistLabel} / ${album.year}` : artistLabel,
    songs,
    title: album?.name ?? "Album not found",
    updatedAt,
  };
};

export const buildArtistDetail = ({
  artistRows,
  getImagePath,
  songRows,
  updatedAt,
}: {
  artistRows: ArtistDetailRow[];
  getImagePath?: CollectionImagePathResolver;
  songRows: LibraryCollectionDetailSongRow[];
  updatedAt: number;
}): LibraryCollectionDetail => {
  const albumIds = new Set<number>();
  artistRows.forEach((row) => {
    if (row.albumId) {
      albumIds.add(row.albumId);
    }
  });

  const artist = artistRows[0];
  const songs = rowsToCollectionDetailSongs(songRows);

  return {
    detail: `${formatCount(songs.length, "song")} / ${formatCount(
      albumIds.size,
      "album",
    )}`,
    eyebrow: "Artist",
    imagePath: artist?.profileImage
      ? getImagePath?.(artist.profileImage) ?? null
      : null,
    isMissing: !artist,
    kind: "artist",
    meta: "Library artist",
    songs,
    title: artist?.name ?? "Artist not found",
    updatedAt,
  };
};
