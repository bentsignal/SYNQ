import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import {
  getCollectionSongAddOperation,
  getCollectionSongAddOperations,
} from "./collection-song-add-step-repository";
import { executeCollectionSongAddOperation } from "./collection-song-add-operation-executor-repository";

export type CollectionSongAddDependencies = {
  addSongToAlbum: (params: {
    albumId: number;
    songId: number;
  }) => Promise<void>;
  addSongToArtist: (params: {
    artistId: number;
    songId: number;
  }) => Promise<void>;
  addSongToPlaylist: (params: {
    playlistId: number;
    songId: number;
  }) => Promise<void>;
};

export { executeCollectionSongAddOperation };

export async function addSongToCollectionWithDependencies(
  {
    collectionId,
    kind,
    songId,
  }: {
    collectionId: number;
    kind: LibraryCollectionDetailKind;
    songId: number;
  },
  dependencies: CollectionSongAddDependencies,
) {
  await executeCollectionSongAddOperation(
    getCollectionSongAddOperation({
      collectionId,
      kind,
      songId,
    }),
    dependencies,
  );
}

export async function addSongsToCollectionWithDependencies(
  {
    collectionId,
    kind,
    songIds,
  }: {
    collectionId: number;
    kind: LibraryCollectionDetailKind;
    songIds: number[];
  },
  dependencies: CollectionSongAddDependencies,
) {
  for (const operation of getCollectionSongAddOperations({
    collectionId,
    kind,
    songIds,
  })) {
    await executeCollectionSongAddOperation(operation, dependencies);
  }
}
