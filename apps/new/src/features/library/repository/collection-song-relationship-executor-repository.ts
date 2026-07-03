import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import {
  assertCanMutatePlaylistMembership,
} from "./collection-song-membership-executor-repository";
import {
  getCollectionSongOrderOperations,
  getCollectionSongRemoveOperation,
} from "./collection-song-relationship-step-repository";

export type CollectionSongRelationshipDependencies = {
  protectedPlaylistIds: Set<number>;
  removeAlbumSong: (params: {
    collectionId: number;
    songId: number;
  }) => Promise<void>;
  removeArtistSong: (params: {
    collectionId: number;
    songId: number;
  }) => Promise<void>;
  removePlaylistSong: (params: {
    collectionId: number;
    songId: number;
  }) => Promise<void>;
  updateAlbumSongOrder: (params: {
    collectionId: number;
    order: number;
    songId: number;
  }) => Promise<void>;
  updateArtistSongOrder: (params: {
    collectionId: number;
    order: number;
    songId: number;
  }) => Promise<void>;
  updatePlaylistSongOrder: (params: {
    collectionId: number;
    order: number;
    songId: number;
  }) => Promise<void>;
};

export async function updateCollectionSongOrderWithDependencies(
  {
    collectionId,
    kind,
    songIds,
  }: {
    collectionId: number;
    kind: LibraryCollectionDetailKind;
    songIds: number[];
  },
  dependencies: CollectionSongRelationshipDependencies,
) {
  if (kind === "playlist") {
    assertCanMutatePlaylistMembership({
      playlistId: collectionId,
      protectedPlaylistIds: dependencies.protectedPlaylistIds,
    });
  }

  for (const operation of getCollectionSongOrderOperations({
    collectionId,
    kind,
    songIds,
  })) {
    const { kind: operationKind, ...params } = operation;

    switch (operationKind) {
      case "album":
        await dependencies.updateAlbumSongOrder(params);
        break;
      case "artist":
        await dependencies.updateArtistSongOrder(params);
        break;
      case "playlist":
        await dependencies.updatePlaylistSongOrder(params);
        break;
    }
  }
}

export async function removeSongFromCollectionWithDependencies(
  {
    collectionId,
    kind,
    songId,
  }: {
    collectionId: number;
    kind: LibraryCollectionDetailKind;
    songId: number;
  },
  dependencies: CollectionSongRelationshipDependencies,
) {
  const operation = getCollectionSongRemoveOperation({
    collectionId,
    kind,
    songId,
  });

  const { kind: operationKind, ...params } = operation;

  switch (operationKind) {
    case "album":
      await dependencies.removeAlbumSong(params);
      return;
    case "artist":
      await dependencies.removeArtistSong(params);
      return;
    case "playlist":
      assertCanMutatePlaylistMembership({
        playlistId: params.collectionId,
        protectedPlaylistIds: dependencies.protectedPlaylistIds,
      });
      await dependencies.removePlaylistSong(params);
  }
}
