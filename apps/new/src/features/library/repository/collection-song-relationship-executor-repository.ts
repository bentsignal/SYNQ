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
import {
  executeCollectionSongOrderOperation,
  executeCollectionSongRemoveOperation,
} from "./collection-song-relationship-operation-executor-repository";

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
    await executeCollectionSongOrderOperation(operation, dependencies);
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

  if (operation.kind === "playlist") {
    assertCanMutatePlaylistMembership({
      playlistId: operation.collectionId,
      protectedPlaylistIds: dependencies.protectedPlaylistIds,
    });
  }

  await executeCollectionSongRemoveOperation(operation, dependencies);
}
