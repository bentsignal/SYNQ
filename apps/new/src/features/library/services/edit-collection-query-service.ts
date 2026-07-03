export type EditCollectionKind = "album" | "artist" | "playlist";

export type EditCollectionAlbumRow = {
  coverImage: string | null;
  name: string | null;
  year: number | null;
};

export type EditCollectionAlbumArtistRow = {
  id: number;
  name: string | null;
};

export type EditCollectionArtistRow = {
  name: string | null;
  profileImage: string | null;
};

export type EditCollectionPlaylistRow = {
  coverImage: string | null;
  name: string | null;
};

export type EditCollectionState = {
  artistNames: string;
  imagePath: string | null;
  isMissing: boolean;
  name: string;
  year: string;
};

export type EditAlbumRowQueryResult = {
  artistRows: EditCollectionAlbumArtistRow[];
  error: unknown;
  row: EditCollectionAlbumRow | undefined;
  updatedAt: Date | undefined;
};

export type EditCollectionRowQueryResult<T> = {
  error: unknown;
  row: T | undefined;
  updatedAt: Date | undefined;
};

export const getEditAlbumRowQueryUpdatedAt = ({
  albumUpdatedAt,
  artistRowsUpdatedAt,
}: {
  albumUpdatedAt: Date | undefined;
  artistRowsUpdatedAt: Date | undefined;
}) => {
  if (albumUpdatedAt && artistRowsUpdatedAt) {
    return new Date(
      Math.max(albumUpdatedAt.getTime(), artistRowsUpdatedAt.getTime()),
    );
  }

  return albumUpdatedAt ?? artistRowsUpdatedAt;
};

export const buildEditAlbumRowQueryResult = ({
  albumError,
  albumRows,
  albumUpdatedAt,
  artistRows,
  artistRowsError,
  artistRowsUpdatedAt,
}: {
  albumError: unknown;
  albumRows: EditCollectionAlbumRow[] | undefined;
  albumUpdatedAt: Date | undefined;
  artistRows: EditCollectionAlbumArtistRow[] | undefined;
  artistRowsError: unknown;
  artistRowsUpdatedAt: Date | undefined;
}): EditAlbumRowQueryResult => ({
  artistRows: artistRows ?? [],
  error: albumError ?? artistRowsError,
  row: albumRows?.[0],
  updatedAt: getEditAlbumRowQueryUpdatedAt({
    albumUpdatedAt,
    artistRowsUpdatedAt,
  }),
});

export const buildEditCollectionRowQueryResult = <
  T extends EditCollectionArtistRow | EditCollectionPlaylistRow,
>({
  error,
  rows,
  updatedAt,
}: {
  error: unknown;
  rows: T[] | undefined;
  updatedAt: Date | undefined;
}): EditCollectionRowQueryResult<T> => ({
  error,
  row: rows?.[0],
  updatedAt,
});

const imagePathOrNull = ({
  getImagePath,
  imageHash,
}: {
  getImagePath: (imageHash: string) => string;
  imageHash: string | null | undefined;
}) => (imageHash ? getImagePath(imageHash) : null);

export const buildEditCollectionState = ({
  albumArtistRows = [],
  albumRow,
  artistRow,
  getImagePath,
  hasLoaded,
  kind,
  playlistRow,
}: {
  albumArtistRows?: EditCollectionAlbumArtistRow[];
  albumRow?: EditCollectionAlbumRow;
  artistRow?: EditCollectionArtistRow;
  getImagePath: (imageHash: string) => string;
  hasLoaded: boolean;
  kind: EditCollectionKind;
  playlistRow?: EditCollectionPlaylistRow;
}): EditCollectionState => {
  if (kind === "album") {
    const artistNames = albumArtistRows
      .flatMap((artist) => (artist.name ? [artist.name] : []))
      .sort((first, second) => first.localeCompare(second))
      .join(", ");

    return {
      artistNames,
      imagePath: imagePathOrNull({
        getImagePath,
        imageHash: albumRow?.coverImage,
      }),
      isMissing: hasLoaded && !albumRow,
      name: albumRow?.name ?? "",
      year: albumRow?.year?.toString() ?? "",
    };
  }

  if (kind === "artist") {
    return {
      artistNames: "",
      imagePath: imagePathOrNull({
        getImagePath,
        imageHash: artistRow?.profileImage,
      }),
      isMissing: hasLoaded && !artistRow,
      name: artistRow?.name ?? "",
      year: "",
    };
  }

  return {
    artistNames: "",
    imagePath: imagePathOrNull({
      getImagePath,
      imageHash: playlistRow?.coverImage,
    }),
    isMissing: hasLoaded && !playlistRow,
    name: playlistRow?.name ?? "",
    year: "",
  };
};
