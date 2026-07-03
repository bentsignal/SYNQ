import {
  rowsToAddableCollectionSongs,
  rowsToLinkedSongIds,
  type AddableCollectionLinkedSongRow,
  type AddableCollectionSong,
  type AddableCollectionSongRow,
} from "./addable-collection-songs-service";

export type AddableCollectionSongsResult = {
  errors: unknown[];
  songs: AddableCollectionSong[];
  updatedAt: number;
};

export const getAddableCollectionSongsErrors = ({
  linkedRowsError,
  songRowsError,
}: {
  linkedRowsError: unknown;
  songRowsError: unknown;
}) => [songRowsError, linkedRowsError].filter(Boolean);

export const getAddableCollectionSongsUpdatedAt = ({
  linkedRowsUpdatedAt,
  songRowsUpdatedAt,
}: {
  linkedRowsUpdatedAt: Date | null | undefined;
  songRowsUpdatedAt: Date | null | undefined;
}) =>
  Math.max(
    songRowsUpdatedAt?.getTime() ?? 0,
    linkedRowsUpdatedAt?.getTime() ?? 0,
  );

export const buildAddableCollectionSongsResult = ({
  linkedRows,
  linkedRowsError,
  linkedRowsUpdatedAt,
  query,
  songRows,
  songRowsError,
  songRowsUpdatedAt,
}: {
  linkedRows: readonly AddableCollectionLinkedSongRow[];
  linkedRowsError: unknown;
  linkedRowsUpdatedAt: Date | null | undefined;
  query?: string;
  songRows: AddableCollectionSongRow[];
  songRowsError: unknown;
  songRowsUpdatedAt: Date | null | undefined;
}): AddableCollectionSongsResult => ({
  errors: getAddableCollectionSongsErrors({
    linkedRowsError,
    songRowsError,
  }),
  songs: rowsToAddableCollectionSongs({
    linkedSongIds: rowsToLinkedSongIds(linkedRows),
    query,
    rows: songRows,
  }),
  updatedAt: getAddableCollectionSongsUpdatedAt({
    linkedRowsUpdatedAt,
    songRowsUpdatedAt,
  }),
});
