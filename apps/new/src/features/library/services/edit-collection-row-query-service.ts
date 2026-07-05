import type {
  EditCollectionAlbumArtistRow,
  EditCollectionAlbumRow,
  EditCollectionArtistRow,
  EditCollectionPlaylistRow,
} from "./edit-collection-state-service";

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

