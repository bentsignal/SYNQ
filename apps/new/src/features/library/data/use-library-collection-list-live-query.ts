import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import {
  buildAlbumPreviewRowsQuery,
  buildArtistPreviewRowsQuery,
  buildPlaylistPreviewRowsQuery,
} from "../repository/collection-preview-query-repository";
import type { CollectionKind } from "../services/library-collection-preview-service";

const buildCollectionListRowsQuery = (kind: CollectionKind) => {
  switch (kind) {
    case "albums":
      return buildAlbumPreviewRowsQuery();
    case "artists":
      return buildArtistPreviewRowsQuery();
    case "playlists":
    default:
      return buildPlaylistPreviewRowsQuery();
  }
};

export function useLibraryCollectionListLiveQuery(kind: CollectionKind) {
  return useLiveQuery(buildCollectionListRowsQuery(kind));
}
