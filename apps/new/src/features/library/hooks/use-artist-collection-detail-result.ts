import { useMemo } from "react";
import {
  buildArtistDetailResult,
} from "../services/library-collection-detail-result-service";
import { getLibrarySmallImagePath } from "../services/library-image-path-service";
import type {
  useArtistCollectionDetailRowsQuery,
} from "./use-library-collection-detail-rows-query";

export function useArtistCollectionDetailResult(
  artist: ReturnType<typeof useArtistCollectionDetailRowsQuery>,
) {
  const detail = useMemo(
    () =>
      buildArtistDetailResult({
        artistRows: artist.artistRows,
        artistUpdatedAt: artist.artistUpdatedAt,
        collectionError: artist.collectionError,
        getImagePath: getLibrarySmallImagePath,
        songRows: artist.songRows,
        songsError: artist.songsError,
        songsUpdatedAt: artist.songsUpdatedAt,
      }),
    [
      artist.artistRows,
      artist.artistUpdatedAt,
      artist.collectionError,
      artist.songRows,
      artist.songsError,
      artist.songsUpdatedAt,
    ],
  );

  return detail;
}
