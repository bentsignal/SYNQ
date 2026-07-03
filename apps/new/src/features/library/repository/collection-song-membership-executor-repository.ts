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

export const getNextSongRelationshipOrder = (orders: (number | null)[]) =>
  orders.reduce<number>(
    (highest, order) => Math.max(highest, order ?? 0),
    0,
  ) + 1;

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

  await dependencies.insertRelationship({ order, ownerId, songId });
  return true;
}

export const assertCanMutatePlaylistMembership = ({
  playlistId,
  protectedPlaylistIds,
}: {
  playlistId: number;
  protectedPlaylistIds: Set<number>;
}) => {
  if (protectedPlaylistIds.has(playlistId)) {
    throw new Error("This protected playlist cannot be changed.");
  }
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
    await dependencies.deleteRelationship({ ownerId: playlistId, songId });
    return false;
  }

  return addOrderedSongRelationshipWithDependencies(
    { ownerId: playlistId, songId },
    dependencies,
  );
}
