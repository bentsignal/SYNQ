import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import {
  buildAlbumLinkedSongRowsQuery,
  buildAllAddableSongRowsQuery,
  buildArtistLinkedSongRowsQuery,
  buildPlaylistLinkedSongRowsQuery,
} from "../repository/addable-collection-songs-query-repository";

export function useAllAddableSongRowsLiveQuery() {
  return useLiveQuery(buildAllAddableSongRowsQuery());
}

export function usePlaylistLinkedSongRowsLiveQuery(collectionId: number) {
  return useLiveQuery(buildPlaylistLinkedSongRowsQuery(collectionId));
}

export function useAlbumLinkedSongRowsLiveQuery(collectionId: number) {
  return useLiveQuery(buildAlbumLinkedSongRowsQuery(collectionId));
}

export function useArtistLinkedSongRowsLiveQuery(collectionId: number) {
  return useLiveQuery(buildArtistLinkedSongRowsQuery(collectionId));
}
