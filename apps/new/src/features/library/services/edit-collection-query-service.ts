import {
  buildEditCollectionState,
  type EditCollectionArtistRow,
  type EditCollectionPlaylistRow,
  type EditCollectionState,
} from "./edit-collection-state-service";
import type {
  EditAlbumRowQueryResult,
  EditCollectionRowQueryResult,
} from "./edit-collection-row-query-service";

export {
  buildEditCollectionState,
  type EditCollectionAlbumArtistRow,
  type EditCollectionAlbumRow,
  type EditCollectionArtistRow,
  type EditCollectionKind,
  type EditCollectionPlaylistRow,
  type EditCollectionState,
} from "./edit-collection-state-service";
export {
  buildEditAlbumRowQueryResult,
  buildEditCollectionRowQueryResult,
  getEditAlbumRowQueryUpdatedAt,
  type EditAlbumRowQueryResult,
  type EditCollectionRowQueryResult,
} from "./edit-collection-row-query-service";

export type EditCollectionQueryResult = EditCollectionState & {
  error: unknown;
  updatedAt: Date | undefined;
};

export const buildEditAlbumCollectionQueryResult = ({
  album,
  getImagePath,
}: {
  album: EditAlbumRowQueryResult;
  getImagePath: (imageHash: string) => string;
}): EditCollectionQueryResult => ({
  error: album.error,
  ...buildEditCollectionState({
    albumArtistRows: album.artistRows,
    albumRow: album.row,
    getImagePath,
    hasLoaded: Boolean(album.updatedAt),
    kind: "album",
  }),
  updatedAt: album.updatedAt,
});

export const buildEditArtistCollectionQueryResult = ({
  artist,
  getImagePath,
}: {
  artist: EditCollectionRowQueryResult<EditCollectionArtistRow>;
  getImagePath: (imageHash: string) => string;
}): EditCollectionQueryResult => ({
  error: artist.error,
  ...buildEditCollectionState({
    artistRow: artist.row,
    getImagePath,
    hasLoaded: Boolean(artist.updatedAt),
    kind: "artist",
  }),
  updatedAt: artist.updatedAt,
});

export const buildEditPlaylistCollectionQueryResult = ({
  getImagePath,
  playlist,
}: {
  getImagePath: (imageHash: string) => string;
  playlist: EditCollectionRowQueryResult<EditCollectionPlaylistRow>;
}): EditCollectionQueryResult => ({
  error: playlist.error,
  ...buildEditCollectionState({
    getImagePath,
    hasLoaded: Boolean(playlist.updatedAt),
    kind: "playlist",
    playlistRow: playlist.row,
  }),
  updatedAt: playlist.updatedAt,
});
