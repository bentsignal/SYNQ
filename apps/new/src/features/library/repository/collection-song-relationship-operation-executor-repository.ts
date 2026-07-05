import type { CollectionSongRelationshipDependencies } from "./collection-song-relationship-dependencies-repository";
import type {
  CollectionSongRelationshipOrderOperation,
  CollectionSongRelationshipRemoveOperation,
} from "./collection-song-relationship-step-repository";

export const executeCollectionSongOrderOperation = async (
  operation: CollectionSongRelationshipOrderOperation,
  dependencies: CollectionSongRelationshipDependencies,
) => {
  const { kind, ...params } = operation;

  switch (kind) {
    case "album":
      await dependencies.updateAlbumSongOrder(params);
      return;
    case "artist":
      await dependencies.updateArtistSongOrder(params);
      return;
    case "playlist":
      await dependencies.updatePlaylistSongOrder(params);
      return;
  }
};

export const executeCollectionSongRemoveOperation = async (
  operation: CollectionSongRelationshipRemoveOperation,
  dependencies: CollectionSongRelationshipDependencies,
) => {
  const { kind, ...params } = operation;

  switch (kind) {
    case "album":
      await dependencies.removeAlbumSong(params);
      return;
    case "artist":
      await dependencies.removeArtistSong(params);
      return;
    case "playlist":
      await dependencies.removePlaylistSong(params);
      return;
  }
};
