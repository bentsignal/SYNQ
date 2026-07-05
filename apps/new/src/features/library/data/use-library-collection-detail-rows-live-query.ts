import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import {
  buildAlbumRowsQuery,
  buildAlbumSongRowsQuery,
  buildArtistRowsQuery,
  buildArtistSongRowsQuery,
} from "../repository/collection-detail-query-repository";
import {
  buildPlaylistRowsQuery,
  buildPlaylistSongRowsQuery,
} from "../repository/playlist-detail-query-repository";

export function usePlaylistCollectionDetailRowsLiveQuery(id: number) {
  const playlist = useLiveQuery(buildPlaylistRowsQuery(id));
  const songs = useLiveQuery(buildPlaylistSongRowsQuery(id));

  return {
    playlist,
    songs,
  };
}

export function useAlbumCollectionDetailRowsLiveQuery(id: number) {
  const album = useLiveQuery(buildAlbumRowsQuery(id));
  const songs = useLiveQuery(buildAlbumSongRowsQuery(id));

  return {
    album,
    songs,
  };
}

export function useArtistCollectionDetailRowsLiveQuery(id: number) {
  const artist = useLiveQuery(buildArtistRowsQuery(id));
  const songs = useLiveQuery(buildArtistSongRowsQuery(id));

  return {
    artist,
    songs,
  };
}
