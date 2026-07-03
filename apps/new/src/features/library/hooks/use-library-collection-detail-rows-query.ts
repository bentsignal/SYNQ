import {
  useAlbumCollectionDetailRowsLiveQuery,
  useArtistCollectionDetailRowsLiveQuery,
  usePlaylistCollectionDetailRowsLiveQuery,
} from "../data/use-library-collection-detail-rows-live-query";
import type {
  AlbumDetailRow,
  ArtistDetailRow,
  LibraryCollectionDetailSongRow,
  PlaylistDetailRow,
} from "../services/library-collection-detail-service";

export function usePlaylistCollectionDetailRowsQuery(id: number) {
  const { playlist, songs } = usePlaylistCollectionDetailRowsLiveQuery(id);

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
  const { album, songs } = useAlbumCollectionDetailRowsLiveQuery(id);

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
  const { artist, songs } = useArtistCollectionDetailRowsLiveQuery(id);

  return {
    artistRows: (artist.data ?? []) as ArtistDetailRow[],
    artistUpdatedAt: artist.updatedAt,
    collectionError: artist.error,
    songsError: songs.error,
    songRows: (songs.data ?? []) as LibraryCollectionDetailSongRow[],
    songsUpdatedAt: songs.updatedAt,
  };
}
