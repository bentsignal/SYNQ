import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import {
  assertCanMutatePlaylistMembership,
} from "./collection-song-membership-executor-repository";

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

  for (let index = 0; index < songIds.length; index += 1) {
    const songId = songIds[index];
    const order = index + 1;

    switch (kind) {
      case "album":
        await dependencies.updateAlbumSongOrder({ collectionId, order, songId });
        break;
      case "artist":
        await dependencies.updateArtistSongOrder({
          collectionId,
          order,
          songId,
        });
        break;
      case "playlist":
        await dependencies.updatePlaylistSongOrder({
          collectionId,
          order,
          songId,
        });
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
  switch (kind) {
    case "album":
      await dependencies.removeAlbumSong({ collectionId, songId });
      return;
    case "artist":
      await dependencies.removeArtistSong({ collectionId, songId });
      return;
    case "playlist":
      assertCanMutatePlaylistMembership({
        playlistId: collectionId,
        protectedPlaylistIds: dependencies.protectedPlaylistIds,
      });
      await dependencies.removePlaylistSong({ collectionId, songId });
  }
}
