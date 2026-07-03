import {
  buildEditCollectionState,
  type EditCollectionAlbumArtistRow,
  type EditCollectionAlbumRow,
  type EditCollectionArtistRow,
  type EditCollectionPlaylistRow,
  type EditCollectionState,
} from "./edit-collection-state-service";

export {
  buildEditCollectionState,
  type EditCollectionAlbumArtistRow,
  type EditCollectionAlbumRow,
  type EditCollectionArtistRow,
  type EditCollectionKind,
  type EditCollectionPlaylistRow,
  type EditCollectionState,
} from "./edit-collection-state-service";

export type EditCollectionQueryResult = EditCollectionState & {
  error: unknown;
  updatedAt: Date | undefined;
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

export const buildEditAlbumCollectionQueryResult = ({
  album,
  getImagePath,
}: {
  album: EditAlbumRowQueryResult;
  getImagePath: (imageHash: string) => string;
}): EditCollectionQueryResult => ({
  error: album.error,
  ...buildEditCollectionState({
    albumArtistRows: album.artistRows,
    albumRow: album.row,
    getImagePath,
    hasLoaded: Boolean(album.updatedAt),
    kind: "album",
  }),
  updatedAt: album.updatedAt,
});

export const buildEditArtistCollectionQueryResult = ({
  artist,
  getImagePath,
}: {
  artist: EditCollectionRowQueryResult<EditCollectionArtistRow>;
  getImagePath: (imageHash: string) => string;
}): EditCollectionQueryResult => ({
  error: artist.error,
  ...buildEditCollectionState({
    artistRow: artist.row,
    getImagePath,
    hasLoaded: Boolean(artist.updatedAt),
    kind: "artist",
  }),
  updatedAt: artist.updatedAt,
});

export const buildEditPlaylistCollectionQueryResult = ({
  getImagePath,
  playlist,
}: {
  getImagePath: (imageHash: string) => string;
  playlist: EditCollectionRowQueryResult<EditCollectionPlaylistRow>;
}): EditCollectionQueryResult => ({
  error: playlist.error,
  ...buildEditCollectionState({
    getImagePath,
    hasLoaded: Boolean(playlist.updatedAt),
    kind: "playlist",
    playlistRow: playlist.row,
  }),
  updatedAt: playlist.updatedAt,
});
