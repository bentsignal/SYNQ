import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import {
  buildAlbumRowsQuery,
  buildAlbumSongRowsQuery,
  buildArtistRowsQuery,
  buildArtistSongRowsQuery,
  buildPlaylistRowsQuery,
  buildPlaylistSongRowsQuery,
} from "../repository/collection-detail-query-repository";
import type {
  AlbumDetailRow,
  ArtistDetailRow,
  LibraryCollectionDetailSongRow,
  PlaylistDetailRow,
} from "../services/library-collection-detail-service";

export function usePlaylistCollectionDetailRowsQuery(id: number) {
  const playlist = useLiveQuery(buildPlaylistRowsQuery(id));
  const songs = useLiveQuery(buildPlaylistSongRowsQuery(id));

  return {
    playlistRows: (playlist.data ?? []) as PlaylistDetailRow[],
    playlistUpdatedAt: playlist.updatedAt,
    songsError: songs.error,
    songRows: (songs.data ?? []) as LibraryCollectionDetailSongRow[],
    songsUpdatedAt: songs.updatedAt,
    collectionError: playlist.error,
  };
}

export function useAlbumCollectionDetailRowsQuery(id: number) {
  const album = useLiveQuery(buildAlbumRowsQuery(id));
  const songs = useLiveQuery(buildAlbumSongRowsQuery(id));

  return {
    albumRows: (album.data ?? []) as AlbumDetailRow[],
    albumUpdatedAt: album.updatedAt,
    collectionError: album.error,
    songsError: songs.error,
    songRows: (songs.data ?? []) as LibraryCollectionDetailSongRow[],
    songsUpdatedAt: songs.updatedAt,
  };
}

export function useArtistCollectionDetailRowsQuery(id: number) {
  const artist = useLiveQuery(buildArtistRowsQuery(id));
  const songs = useLiveQuery(buildArtistSongRowsQuery(id));

  return {
    artistRows: (artist.data ?? []) as ArtistDetailRow[],
    artistUpdatedAt: artist.updatedAt,
    collectionError: artist.error,
    songsError: songs.error,
    songRows: (songs.data ?? []) as LibraryCollectionDetailSongRow[],
    songsUpdatedAt: songs.updatedAt,
  };
}
