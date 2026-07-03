import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import {
  buildLibrarySongDetailAlbumRowsQuery,
  buildLibrarySongDetailArtistRowsQuery,
  buildLibrarySongDetailLikedRowsQuery,
  buildLibrarySongDetailPlaylistRowsQuery,
  buildLibrarySongDetailRowsQuery,
} from "../repository/library-song-detail-query-repository";

export function useLibrarySongDetailLiveQuery(songId: number) {
  const song = useLiveQuery(buildLibrarySongDetailRowsQuery(songId));
  const artists = useLiveQuery(buildLibrarySongDetailArtistRowsQuery(songId));
  const albums = useLiveQuery(buildLibrarySongDetailAlbumRowsQuery(songId));
  const playlists = useLiveQuery(buildLibrarySongDetailPlaylistRowsQuery(songId));
  const liked = useLiveQuery(buildLibrarySongDetailLikedRowsQuery(songId));

  return {
    albums,
    artists,
    liked,
    playlists,
    song,
  };
}
