import {
  assertCanMutatePlaylistMembership,
  getLikedSongRelationshipDelete,
} from "./collection-song-membership-step-repository";
import {
  addOrderedSongRelationshipWithDependencies,
  getNextSongRelationshipOrder,
  type OrderedSongRelationshipDependencies,
} from "./ordered-song-relationship-executor-repository";

export {
  addOrderedSongRelationshipWithDependencies,
  assertCanMutatePlaylistMembership,
  getNextSongRelationshipOrder,
};
export type { OrderedSongRelationshipDependencies };

export type LikedSongMembershipDependencies =
  OrderedSongRelationshipDependencies & {
    deleteRelationship: (params: {
      ownerId: number;
      songId: number;
    }) => Promise<void>;
};

export async function addSongToPlaylistWithDependencies(
  {
    playlistId,
    protectedPlaylistIds,
    songId,
  }: {
    playlistId: number;
    protectedPlaylistIds: Set<number>;
    songId: number;
  },
  dependencies: OrderedSongRelationshipDependencies,
) {
  assertCanMutatePlaylistMembership({ playlistId, protectedPlaylistIds });

  return addOrderedSongRelationshipWithDependencies(
    { ownerId: playlistId, songId },
    dependencies,
  );
}

export async function setLikedSongMembershipWithDependencies(
  {
    liked,
    playlistId,
    songId,
  }: {
    liked: boolean;
    playlistId: number;
    songId: number;
  },
  dependencies: LikedSongMembershipDependencies,
) {
  if (!liked) {
    await dependencies.deleteRelationship(
      getLikedSongRelationshipDelete({ playlistId, songId }),
    );
    return false;
  }

  return addOrderedSongRelationshipWithDependencies(
    { ownerId: playlistId, songId },
    dependencies,
  );
}
