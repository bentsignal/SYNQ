import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import {
  assertCanMutatePlaylistMembership,
} from "./collection-song-membership-executor-repository";
import {
  getCollectionSongOrderOperations,
  getCollectionSongRemoveOperation,
} from "./collection-song-relationship-step-repository";
import type {
  CollectionSongRelationshipDependencies,
} from "./collection-song-relationship-dependencies-repository";

export type {
  CollectionSongRelationshipDependencies,
} from "./collection-song-relationship-dependencies-repository";

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
