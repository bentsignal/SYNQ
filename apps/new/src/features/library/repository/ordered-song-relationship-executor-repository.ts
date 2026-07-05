import {
  getNextSongRelationshipOrder,
  getOrderedSongRelationshipInsert,
} from "./collection-song-membership-step-repository";

export { getNextSongRelationshipOrder };

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
