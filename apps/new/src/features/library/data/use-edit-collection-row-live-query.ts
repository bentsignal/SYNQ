import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import {
  buildEditAlbumArtistRowsQuery,
  buildEditAlbumRowQuery,
  buildEditArtistRowQuery,
  buildEditPlaylistRowQuery,
} from "../repository/edit-collection-query-repository";

export function useEditAlbumRowLiveQuery(id: number) {
  const album = useLiveQuery(buildEditAlbumRowQuery(id));
  const artists = useLiveQuery(buildEditAlbumArtistRowsQuery(id));

  return {
    album,
    artists,
  };
}

export function useEditArtistRowLiveQuery(id: number) {
  return useLiveQuery(buildEditArtistRowQuery(id));
}

export function useEditPlaylistRowLiveQuery(id: number) {
  return useLiveQuery(buildEditPlaylistRowQuery(id));
}
