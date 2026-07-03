import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import {
  getCollectionSongAddOperation,
  getCollectionSongAddOperations,
  type CollectionSongAddOperation,
} from "./collection-song-add-step-repository";

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

const executeCollectionSongAddOperation = async (
  operation: CollectionSongAddOperation,
  dependencies: CollectionSongAddDependencies,
) => {
  switch (operation.kind) {
    case "album":
      await dependencies.addSongToAlbum({
        albumId: operation.albumId,
        songId: operation.songId,
      });
      return;
    case "artist":
      await dependencies.addSongToArtist({
        artistId: operation.artistId,
        songId: operation.songId,
      });
      return;
    case "playlist":
      await dependencies.addSongToPlaylist({
        playlistId: operation.playlistId,
        songId: operation.songId,
      });
  }
};

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
