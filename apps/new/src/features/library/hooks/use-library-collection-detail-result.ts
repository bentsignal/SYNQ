import { useMemo } from "react";
import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";
import {
  buildAlbumDetail,
  buildArtistDetail,
  buildPlaylistDetail,
} from "../services/library-collection-detail-service";
import type {
  useAlbumCollectionDetailRowsQuery,
  useArtistCollectionDetailRowsQuery,
  usePlaylistCollectionDetailRowsQuery,
} from "./use-library-collection-detail-rows-query";

const getSmallImagePath = (imageHash: string) =>
  getImagePathFromHash(imageHash).pathToSmallImage;

export function usePlaylistCollectionDetailResult(
  playlist: ReturnType<typeof usePlaylistCollectionDetailRowsQuery>,
) {
  const detail = useMemo(
    () =>
      buildPlaylistDetail({
        getImagePath: getSmallImagePath,
        playlistRows: playlist.playlistRows,
        songRows: playlist.songRows,
        updatedAt: Math.max(
          playlist.playlistUpdatedAt?.getTime() ?? 0,
          playlist.songsUpdatedAt?.getTime() ?? 0,
        ),
      }),
    [
      playlist.playlistRows,
      playlist.playlistUpdatedAt,
      playlist.songRows,
      playlist.songsUpdatedAt,
    ],
  );

  return {
    detail,
    errors: [playlist.collectionError, playlist.songsError].filter(Boolean),
  };
}

export function useAlbumCollectionDetailResult(
  album: ReturnType<typeof useAlbumCollectionDetailRowsQuery>,
) {
  const detail = useMemo(
    () =>
      buildAlbumDetail({
        albumRows: album.albumRows,
        getImagePath: getSmallImagePath,
        songRows: album.songRows,
        updatedAt: Math.max(
          album.albumUpdatedAt?.getTime() ?? 0,
          album.songsUpdatedAt?.getTime() ?? 0,
        ),
      }),
    [album.albumRows, album.albumUpdatedAt, album.songRows, album.songsUpdatedAt],
  );

  return {
    detail,
    errors: [album.collectionError, album.songsError].filter(Boolean),
  };
}

export function useArtistCollectionDetailResult(
  artist: ReturnType<typeof useArtistCollectionDetailRowsQuery>,
) {
  const detail = useMemo(
    () =>
      buildArtistDetail({
        artistRows: artist.artistRows,
        getImagePath: getSmallImagePath,
        songRows: artist.songRows,
        updatedAt: Math.max(
          artist.artistUpdatedAt?.getTime() ?? 0,
          artist.songsUpdatedAt?.getTime() ?? 0,
        ),
      }),
    [
      artist.artistRows,
      artist.artistUpdatedAt,
      artist.songRows,
      artist.songsUpdatedAt,
    ],
  );

  return {
    detail,
    errors: [artist.collectionError, artist.songsError].filter(Boolean),
  };
}
