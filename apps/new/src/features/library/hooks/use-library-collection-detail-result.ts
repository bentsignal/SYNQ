import { useMemo } from "react";
import {
  buildAlbumDetailResult,
  buildArtistDetailResult,
  buildPlaylistDetailResult,
} from "../services/library-collection-detail-result-service";
import { getLibrarySmallImagePath } from "../services/library-image-path-service";
import type {
  useAlbumCollectionDetailRowsQuery,
  useArtistCollectionDetailRowsQuery,
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
