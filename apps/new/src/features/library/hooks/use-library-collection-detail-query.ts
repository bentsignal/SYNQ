import { useMemo } from "react";
import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";
import {
  useAlbumCollectionDetailRowsQuery,
  useArtistCollectionDetailRowsQuery,
  usePlaylistCollectionDetailRowsQuery,
} from "./use-library-collection-detail-rows-query";
import {
  buildAlbumDetail,
  buildArtistDetail,
  buildPlaylistDetail,
} from "../services/library-collection-detail-service";

export type {
  LibraryCollectionDetailKind,
  LibraryCollectionDetailSong,
} from "../services/library-collection-detail-service";

const getSmallImagePath = (imageHash: string) =>
  getImagePathFromHash(imageHash).pathToSmallImage;

export function usePlaylistCollectionDetailQuery({ id }: { id: number }) {
  const playlist = usePlaylistCollectionDetailRowsQuery(id);
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

export function useAlbumCollectionDetailQuery({ id }: { id: number }) {
  const album = useAlbumCollectionDetailRowsQuery(id);
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

export function useArtistCollectionDetailQuery({ id }: { id: number }) {
  const artist = useArtistCollectionDetailRowsQuery(id);
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
