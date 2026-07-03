import {
  useAlbumLinkedSongRowsLiveQuery,
  useAllAddableSongRowsLiveQuery,
  useArtistLinkedSongRowsLiveQuery,
  usePlaylistLinkedSongRowsLiveQuery,
} from "../data/use-addable-collection-song-rows-live-query";
import type {
  AddableCollectionLinkedSongRow,
  AddableCollectionSongRow,
} from "../services/addable-collection-songs-service";

export function useAllAddableSongRowsQuery() {
  const songs = useAllAddableSongRowsLiveQuery();

  return {
    error: songs.error,
    rows: (songs.data ?? []) as AddableCollectionSongRow[],
    updatedAt: songs.updatedAt,
  };
}

export function usePlaylistLinkedSongRowsQuery(collectionId: number) {
  const linkedSongs = usePlaylistLinkedSongRowsLiveQuery(collectionId);

  return {
    error: linkedSongs.error,
    rows: (linkedSongs.data ?? []) as AddableCollectionLinkedSongRow[],
    updatedAt: linkedSongs.updatedAt,
  };
}

export function useAlbumLinkedSongRowsQuery(collectionId: number) {
  const linkedSongs = useAlbumLinkedSongRowsLiveQuery(collectionId);

  return {
    error: linkedSongs.error,
    rows: (linkedSongs.data ?? []) as AddableCollectionLinkedSongRow[],
    updatedAt: linkedSongs.updatedAt,
  };
}

export function useArtistLinkedSongRowsQuery(collectionId: number) {
  const linkedSongs = useArtistLinkedSongRowsLiveQuery(collectionId);

  return {
    error: linkedSongs.error,
    rows: (linkedSongs.data ?? []) as AddableCollectionLinkedSongRow[],
    updatedAt: linkedSongs.updatedAt,
  };
}
