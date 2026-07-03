import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import {
  buildAlbumPreviewRowsQuery,
  buildArtistPreviewRowsQuery,
  buildPlaylistPreviewRowsQuery,
} from "../repository/collection-preview-query-repository";

export function useLibraryCollectionPreviewLiveQuery() {
  const playlists = useLiveQuery(buildPlaylistPreviewRowsQuery());
  const albums = useLiveQuery(buildAlbumPreviewRowsQuery());
  const artists = useLiveQuery(buildArtistPreviewRowsQuery());

  return {
    albums,
    artists,
    playlists,
  };
}
