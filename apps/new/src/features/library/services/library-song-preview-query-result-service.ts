import {
  rowsToSongPreviews,
  type LibrarySongPreview,
  type LibrarySongPreviewOrder,
  type LibrarySongPreviewRow,
  type LibrarySongPreviewSort,
} from "./library-song-preview-service";

export type LibrarySongPreviewQueryResult = {
  error: unknown;
  isEmpty: boolean;
  songs: LibrarySongPreview[];
  updatedAt: number;
};

export const getLibrarySongPreviewQueryUpdatedAt = (
  updatedAt: Date | null | undefined,
) => updatedAt?.getTime() ?? 0;

export const buildLibrarySongPreviewQueryResult = ({
  error,
  limit,
  order,
  query,
  rows,
  sort,
  updatedAt,
}: {
  error: unknown;
  limit: number;
  order: LibrarySongPreviewOrder;
  query?: string;
  rows: LibrarySongPreviewRow[];
  sort: LibrarySongPreviewSort;
  updatedAt: Date | null | undefined;
}): LibrarySongPreviewQueryResult => {
  const songs = rowsToSongPreviews({
    limit,
    order,
    query,
    rows,
    sort,
  });

  return {
    error,
    isEmpty: songs.length === 0,
    songs,
    updatedAt: getLibrarySongPreviewQueryUpdatedAt(updatedAt),
  };
};
