export const getNextSongRelationshipOrder = (orders: (number | null)[]) =>
  orders.reduce<number>(
    (highest, order) => Math.max(highest, order ?? 0),
    0,
  ) + 1;

export const getOrderedSongRelationshipInsert = ({
  order,
  ownerId,
  songId,
}: {
  order: number;
  ownerId: number;
  songId: number;
}) => ({
  order,
  ownerId,
  songId,
});

export const getLikedSongRelationshipDelete = ({
  playlistId,
  songId,
}: {
  playlistId: number;
  songId: number;
}) => ({
  ownerId: playlistId,
  songId,
});

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
