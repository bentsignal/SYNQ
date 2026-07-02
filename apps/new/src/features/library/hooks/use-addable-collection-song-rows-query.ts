import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import {
  buildAlbumLinkedSongRowsQuery,
  buildAllAddableSongRowsQuery,
  buildArtistLinkedSongRowsQuery,
  buildPlaylistLinkedSongRowsQuery,
} from "../repository/addable-collection-songs-query-repository";
import type {
  AddableCollectionLinkedSongRow,
  AddableCollectionSongRow,
} from "../services/addable-collection-songs-service";

export function useAllAddableSongRowsQuery() {
  const songs = useLiveQuery(buildAllAddableSongRowsQuery());

  return {
    error: songs.error,
    rows: (songs.data ?? []) as AddableCollectionSongRow[],
    updatedAt: songs.updatedAt,
  };
}

export function usePlaylistLinkedSongRowsQuery(collectionId: number) {
  const linkedSongs = useLiveQuery(buildPlaylistLinkedSongRowsQuery(collectionId));

  return {
    error: linkedSongs.error,
    rows: (linkedSongs.data ?? []) as AddableCollectionLinkedSongRow[],
    updatedAt: linkedSongs.updatedAt,
  };
}

export function useAlbumLinkedSongRowsQuery(collectionId: number) {
  const linkedSongs = useLiveQuery(buildAlbumLinkedSongRowsQuery(collectionId));

  return {
    error: linkedSongs.error,
    rows: (linkedSongs.data ?? []) as AddableCollectionLinkedSongRow[],
    updatedAt: linkedSongs.updatedAt,
  };
}

export function useArtistLinkedSongRowsQuery(collectionId: number) {
  const linkedSongs = useLiveQuery(buildArtistLinkedSongRowsQuery(collectionId));

  return {
    error: linkedSongs.error,
    rows: (linkedSongs.data ?? []) as AddableCollectionLinkedSongRow[],
    updatedAt: linkedSongs.updatedAt,
  };
}
