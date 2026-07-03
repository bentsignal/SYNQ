import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import {
  buildEditAlbumArtistRowsQuery,
  buildEditAlbumRowQuery,
  buildEditArtistRowQuery,
  buildEditPlaylistRowQuery,
} from "../repository/edit-collection-query-repository";
import type {
  EditCollectionAlbumArtistRow,
  EditCollectionAlbumRow,
  EditCollectionArtistRow,
  EditCollectionPlaylistRow,
} from "../services/edit-collection-query-service";

export function useEditAlbumRowQuery(id: number) {
  const album = useLiveQuery(buildEditAlbumRowQuery(id));
  const artists = useLiveQuery(buildEditAlbumArtistRowsQuery(id));

  return {
    artistRows: (artists.data ?? []) as EditCollectionAlbumArtistRow[],
    error: album.error ?? artists.error,
    row: album.data?.[0] as EditCollectionAlbumRow | undefined,
    updatedAt:
      album.updatedAt && artists.updatedAt
        ? new Date(
            Math.max(album.updatedAt.getTime(), artists.updatedAt.getTime()),
          )
        : album.updatedAt ?? artists.updatedAt,
  };
}

export function useEditArtistRowQuery(id: number) {
  const artist = useLiveQuery(buildEditArtistRowQuery(id));

  return {
    error: artist.error,
    row: artist.data?.[0] as EditCollectionArtistRow | undefined,
    updatedAt: artist.updatedAt,
  };
}

export function useEditPlaylistRowQuery(id: number) {
  const playlist = useLiveQuery(buildEditPlaylistRowQuery(id));

  return {
    error: playlist.error,
    row: playlist.data?.[0] as EditCollectionPlaylistRow | undefined,
    updatedAt: playlist.updatedAt,
  };
}
