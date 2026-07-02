import { useMemo } from "react";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";
import {
  buildAlbumRowsQuery,
  buildAlbumSongRowsQuery,
  buildArtistRowsQuery,
  buildArtistSongRowsQuery,
  buildPlaylistRowsQuery,
  buildPlaylistSongRowsQuery,
} from "../repository/collection-detail-query-repository";
import {
  buildAlbumDetail,
  buildArtistDetail,
  buildPlaylistDetail,
  type AlbumDetailRow,
  type ArtistDetailRow,
  type LibraryCollectionDetailSongRow,
  type PlaylistDetailRow,
} from "../services/library-collection-detail-service";

export type {
  LibraryCollectionDetailKind,
  LibraryCollectionDetailSong,
} from "../services/library-collection-detail-service";

const getSmallImagePath = (imageHash: string) =>
  getImagePathFromHash(imageHash).pathToSmallImage;

function usePlaylistRowsQuery(id: number) {
  return useLiveQuery(buildPlaylistRowsQuery(id));
}

function usePlaylistSongRowsQuery(id: number) {
  return useLiveQuery(buildPlaylistSongRowsQuery(id));
}

function useAlbumRowsQuery(id: number) {
  return useLiveQuery(buildAlbumRowsQuery(id));
}

function useAlbumSongRowsQuery(id: number) {
  return useLiveQuery(buildAlbumSongRowsQuery(id));
}

function useArtistRowsQuery(id: number) {
  return useLiveQuery(buildArtistRowsQuery(id));
}

function useArtistSongRowsQuery(id: number) {
  return useLiveQuery(buildArtistSongRowsQuery(id));
}

export function usePlaylistCollectionDetailQuery({ id }: { id: number }) {
  const playlist = usePlaylistRowsQuery(id);
  const playlistSongs = usePlaylistSongRowsQuery(id);
  const detail = useMemo(
    () =>
      buildPlaylistDetail({
        getImagePath: getSmallImagePath,
        playlistRows: (playlist.data ?? []) as PlaylistDetailRow[],
        songRows: (playlistSongs.data ?? []) as LibraryCollectionDetailSongRow[],
        updatedAt: Math.max(
          playlist.updatedAt?.getTime() ?? 0,
          playlistSongs.updatedAt?.getTime() ?? 0,
        ),
      }),
    [
      playlist.data,
      playlist.updatedAt,
      playlistSongs.data,
      playlistSongs.updatedAt,
    ],
  );

  return {
    detail,
    errors: [playlist.error, playlistSongs.error].filter(Boolean),
  };
}

export function useAlbumCollectionDetailQuery({ id }: { id: number }) {
  const album = useAlbumRowsQuery(id);
  const albumSongs = useAlbumSongRowsQuery(id);
  const detail = useMemo(
    () =>
      buildAlbumDetail({
        albumRows: (album.data ?? []) as AlbumDetailRow[],
        getImagePath: getSmallImagePath,
        songRows: (albumSongs.data ?? []) as LibraryCollectionDetailSongRow[],
        updatedAt: Math.max(
          album.updatedAt?.getTime() ?? 0,
          albumSongs.updatedAt?.getTime() ?? 0,
        ),
      }),
    [album.data, album.updatedAt, albumSongs.data, albumSongs.updatedAt],
  );

  return {
    detail,
    errors: [album.error, albumSongs.error].filter(Boolean),
  };
}

export function useArtistCollectionDetailQuery({ id }: { id: number }) {
  const artist = useArtistRowsQuery(id);
  const artistSongs = useArtistSongRowsQuery(id);
  const detail = useMemo(
    () =>
      buildArtistDetail({
        artistRows: (artist.data ?? []) as ArtistDetailRow[],
        getImagePath: getSmallImagePath,
        songRows: (artistSongs.data ?? []) as LibraryCollectionDetailSongRow[],
        updatedAt: Math.max(
          artist.updatedAt?.getTime() ?? 0,
          artistSongs.updatedAt?.getTime() ?? 0,
        ),
      }),
    [artist.data, artist.updatedAt, artistSongs.data, artistSongs.updatedAt],
  );

  return {
    detail,
    errors: [artist.error, artistSongs.error].filter(Boolean),
  };
}
