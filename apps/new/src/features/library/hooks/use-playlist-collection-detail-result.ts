import { useMemo } from "react";
import {
  buildPlaylistDetailResult,
} from "../services/library-collection-detail-result-service";
import { getLibrarySmallImagePath } from "../services/library-image-path-service";
import type {
  usePlaylistCollectionDetailRowsQuery,
} from "./use-library-collection-detail-rows-query";

export function usePlaylistCollectionDetailResult(
  playlist: ReturnType<typeof usePlaylistCollectionDetailRowsQuery>,
) {
  const detail = useMemo(
    () =>
      buildPlaylistDetailResult({
        collectionError: playlist.collectionError,
        getImagePath: getLibrarySmallImagePath,
        playlistRows: playlist.playlistRows,
        playlistUpdatedAt: playlist.playlistUpdatedAt,
        songRows: playlist.songRows,
        songsError: playlist.songsError,
        songsUpdatedAt: playlist.songsUpdatedAt,
      }),
    [
      playlist.collectionError,
      playlist.playlistRows,
      playlist.playlistUpdatedAt,
      playlist.songsError,
      playlist.songRows,
      playlist.songsUpdatedAt,
    ],
  );

  return detail;
}
