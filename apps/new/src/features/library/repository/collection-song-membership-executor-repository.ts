import {
  assertCanMutatePlaylistMembership,
  getLikedSongRelationshipDelete,
  getNextSongRelationshipOrder,
  getOrderedSongRelationshipInsert,
} from "./collection-song-membership-step-repository";

export { assertCanMutatePlaylistMembership, getNextSongRelationshipOrder };

export type OrderedSongRelationshipDependencies = {
  findRelationshipId: (params: {
    ownerId: number;
    songId: number;
  }) => Promise<number | null>;
  insertRelationship: (params: {
    order: number;
    ownerId: number;
    songId: number;
  }) => Promise<void>;
  loadRelationshipOrders: (ownerId: number) => Promise<(number | null)[]>;
};

export type LikedSongMembershipDependencies =
  OrderedSongRelationshipDependencies & {
    deleteRelationship: (params: {
      ownerId: number;
      songId: number;
    }) => Promise<void>;
  };

export async function addOrderedSongRelationshipWithDependencies(
  {
    ownerId,
    songId,
  }: {
    ownerId: number;
    songId: number;
  },
  dependencies: OrderedSongRelationshipDependencies,
) {
  const existingId = await dependencies.findRelationshipId({ ownerId, songId });

  if (existingId !== null) {
    return false;
  }

  const order = getNextSongRelationshipOrder(
    await dependencies.loadRelationshipOrders(ownerId),
  );

  await dependencies.insertRelationship(
    getOrderedSongRelationshipInsert({ order, ownerId, songId }),
  );
  return true;
}

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
