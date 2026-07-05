import {
  rowsToAddableCollectionSongs,
  rowsToLinkedSongIds,
} from "./addable-collection-songs-service";
import type {
  AddableCollectionLinkedSongRow,
  AddableCollectionSong,
  AddableCollectionSongRow,
} from "./addable-collection-songs-types-service";
import {
  getAddableCollectionSongsErrors,
  getAddableCollectionSongsUpdatedAt,
} from "./addable-collection-songs-result-metadata-service";

export type AddableCollectionSongsResult = {
  errors: unknown[];
  songs: AddableCollectionSong[];
  updatedAt: number;
};

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

export {
  getAddableCollectionSongsErrors,
  getAddableCollectionSongsUpdatedAt,
} from "./addable-collection-songs-result-metadata-service";
