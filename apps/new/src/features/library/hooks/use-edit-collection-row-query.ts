import {
  useEditAlbumRowLiveQuery,
  useEditArtistRowLiveQuery,
  useEditPlaylistRowLiveQuery,
} from "../data/use-edit-collection-row-live-query";
import {
  buildEditAlbumRowQueryResult,
  buildEditCollectionRowQueryResult,
} from "../services/edit-collection-row-query-service";
import type {
  EditCollectionAlbumArtistRow,
  EditCollectionAlbumRow,
  EditCollectionArtistRow,
  EditCollectionPlaylistRow,
} from "../services/edit-collection-state-service";

export function useEditAlbumRowQuery(id: number) {
  const { album, artists } = useEditAlbumRowLiveQuery(id);

  return buildEditAlbumRowQueryResult({
    albumError: album.error,
    albumRows: album.data as EditCollectionAlbumRow[] | undefined,
    albumUpdatedAt: album.updatedAt,
    artistRows: artists.data as EditCollectionAlbumArtistRow[] | undefined,
    artistRowsError: artists.error,
    artistRowsUpdatedAt: artists.updatedAt,
  });
}

export function useEditArtistRowQuery(id: number) {
  const artist = useEditArtistRowLiveQuery(id);

  return buildEditCollectionRowQueryResult({
    error: artist.error,
    rows: artist.data as EditCollectionArtistRow[] | undefined,
    updatedAt: artist.updatedAt,
  });
}

export function useEditPlaylistRowQuery(id: number) {
  const playlist = useEditPlaylistRowLiveQuery(id);

  return buildEditCollectionRowQueryResult({
    error: playlist.error,
    rows: playlist.data as EditCollectionPlaylistRow[] | undefined,
    updatedAt: playlist.updatedAt,
  });
}
