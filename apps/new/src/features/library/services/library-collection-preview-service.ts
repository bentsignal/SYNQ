export type CollectionKind = "albums" | "artists" | "playlists";

export type LibraryCollectionPreview = {
  detail: string;
  id: number;
  imagePath: string | null;
  kind: CollectionKind;
  meta: string;
  title: string;
};

export type LibraryCollectionPreviewHref =
  | `/(tabs)/library/album/${number}`
  | `/(tabs)/library/artist/${number}`
  | `/(tabs)/library/playlist/${number}`;

export type CollectionPreviewImagePathResolver = (
  imageHash: string,
) => string | null;

export type PlaylistPreviewRow = {
  coverImage: string | null;
  playlistId: number;
  playlistName: string | null;
  songId: number | null;
};

export type AlbumPreviewRow = {
  albumCoverImage: string | null;
  albumId: number;
  albumName: string | null;
  artistName: string | null;
  songId: number | null;
  year: number | null;
};

export type ArtistPreviewRow = {
  albumId: number | null;
  artistId: number;
  artistName: string | null;
  profileImage: string | null;
  songId: number | null;
};

const formatCount = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

const formatArtists = (artists: Set<string>) => {
  if (artists.size === 0) {
    return "Unknown artist";
  }

  return Array.from(artists).sort((first, second) =>
    first.localeCompare(second),
  ).join(", ");
};

const limitCollectionPreviews = (
  previews: LibraryCollectionPreview[],
  limit: number | null,
) => (limit === null ? previews : previews.slice(0, limit));

export const getLibraryCollectionPreviewHref = (
  collection: Pick<LibraryCollectionPreview, "id" | "kind">,
): LibraryCollectionPreviewHref => {
  switch (collection.kind) {
    case "albums":
      return `/(tabs)/library/album/${collection.id}`;
    case "artists":
      return `/(tabs)/library/artist/${collection.id}`;
    case "playlists":
    default:
      return `/(tabs)/library/playlist/${collection.id}`;
  }
};

export const getLibraryCollectionPreviewEmptyState = () => ({
  body: "Create a playlist, album, or artist once you have songs to organize.",
  title: "No collections yet",
});

export const playlistRowsToPreview = ({
  getImagePath,
  limit,
  rows,
}: {
  getImagePath?: CollectionPreviewImagePathResolver;
  limit: number | null;
  rows: PlaylistPreviewRow[];
}) => {
  const playlistMap = new Map<
    number,
    {
      coverImage: string | null;
      name: string;
      songIds: Set<number>;
    }
  >();

  rows.forEach((row) => {
    const playlist =
      playlistMap.get(row.playlistId) ??
      {
        coverImage: row.coverImage,
        name: row.playlistName ?? "Untitled playlist",
        songIds: new Set<number>(),
      };

    if (row.songId) {
      playlist.songIds.add(row.songId);
    }

    playlistMap.set(row.playlistId, playlist);
  });

  const previews = Array.from(playlistMap.entries())
    .map<LibraryCollectionPreview>(([id, playlist]) => ({
      detail: formatCount(playlist.songIds.size, "song"),
      id,
      imagePath: playlist.coverImage
        ? getImagePath?.(playlist.coverImage) ?? null
        : null,
      kind: "playlists",
      meta: "Playlist",
      title: playlist.name,
    }))
    .sort((first, second) => second.id - first.id);

  return limitCollectionPreviews(previews, limit);
};

export const albumRowsToPreview = ({
  getImagePath,
  limit,
  rows,
}: {
  getImagePath?: CollectionPreviewImagePathResolver;
  limit: number | null;
  rows: AlbumPreviewRow[];
}) => {
  const albumMap = new Map<
    number,
    {
      artistNames: Set<string>;
      coverImage: string | null;
      name: string;
      songIds: Set<number>;
      year: number | null;
    }
  >();

  rows.forEach((row) => {
    const album =
      albumMap.get(row.albumId) ??
      {
        artistNames: new Set<string>(),
        coverImage: row.albumCoverImage,
        name: row.albumName ?? "Untitled album",
        songIds: new Set<number>(),
        year: row.year,
      };

    if (row.artistName) {
      album.artistNames.add(row.artistName);
    }

    if (row.songId) {
      album.songIds.add(row.songId);
    }

    albumMap.set(row.albumId, album);
  });

  const previews = Array.from(albumMap.entries())
    .map<LibraryCollectionPreview>(([id, album]) => ({
      detail: formatCount(album.songIds.size, "song"),
      id,
      imagePath: album.coverImage
        ? getImagePath?.(album.coverImage) ?? null
        : null,
      kind: "albums",
      meta: album.year
        ? `${formatArtists(album.artistNames)} / ${album.year}`
        : formatArtists(album.artistNames),
      title: album.name,
    }))
    .sort((first, second) => first.title.localeCompare(second.title));

  return limitCollectionPreviews(previews, limit);
};

export const artistRowsToPreview = ({
  getImagePath,
  limit,
  rows,
}: {
  getImagePath?: CollectionPreviewImagePathResolver;
  limit: number | null;
  rows: ArtistPreviewRow[];
}) => {
  const artistMap = new Map<
    number,
    {
      albumIds: Set<number>;
      name: string;
      profileImage: string | null;
      songIds: Set<number>;
    }
  >();

  rows.forEach((row) => {
    const artist =
      artistMap.get(row.artistId) ??
      {
        albumIds: new Set<number>(),
        name: row.artistName ?? "Untitled artist",
        profileImage: row.profileImage,
        songIds: new Set<number>(),
      };

    if (row.albumId) {
      artist.albumIds.add(row.albumId);
    }

    if (row.songId) {
      artist.songIds.add(row.songId);
    }

    artistMap.set(row.artistId, artist);
  });

  const previews = Array.from(artistMap.entries())
    .map<LibraryCollectionPreview>(([id, artist]) => ({
      detail: `${formatCount(artist.songIds.size, "song")} / ${formatCount(
        artist.albumIds.size,
        "album",
      )}`,
      id,
      imagePath: artist.profileImage
        ? getImagePath?.(artist.profileImage) ?? null
        : null,
      kind: "artists",
      meta: "Artist",
      title: artist.name,
    }))
    .sort((first, second) => first.title.localeCompare(second.title));

  return limitCollectionPreviews(previews, limit);
};
