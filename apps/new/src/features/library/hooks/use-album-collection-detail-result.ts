import { useMemo } from "react";
import {
  buildAlbumDetailResult,
} from "../services/library-collection-detail-result-service";
import { getLibrarySmallImagePath } from "../services/library-image-path-service";
import type {
  useAlbumCollectionDetailRowsQuery,
} from "./use-library-collection-detail-rows-query";

export function useAlbumCollectionDetailResult(
  album: ReturnType<typeof useAlbumCollectionDetailRowsQuery>,
) {
  const detail = useMemo(
    () =>
      buildAlbumDetailResult({
        albumRows: album.albumRows,
        albumUpdatedAt: album.albumUpdatedAt,
        collectionError: album.collectionError,
        getImagePath: getLibrarySmallImagePath,
        songRows: album.songRows,
        songsError: album.songsError,
        songsUpdatedAt: album.songsUpdatedAt,
      }),
    [
      album.albumRows,
      album.albumUpdatedAt,
      album.collectionError,
      album.songRows,
      album.songsError,
      album.songsUpdatedAt,
    ],
  );

  return detail;
}
