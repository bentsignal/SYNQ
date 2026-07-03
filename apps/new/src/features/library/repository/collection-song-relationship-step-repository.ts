import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";

type CollectionSongRelationshipOrderOperation = {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  order: number;
  songId: number;
};

type CollectionSongRelationshipRemoveOperation = {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  songId: number;
};

export const getCollectionSongOrderOperations = ({
  collectionId,
  kind,
  songIds,
}: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  songIds: number[];
}): CollectionSongRelationshipOrderOperation[] =>
  songIds.map((songId, index) => ({
    collectionId,
    kind,
    order: index + 1,
    songId,
  }));

export const getCollectionSongRemoveOperation = ({
  collectionId,
  kind,
  songId,
}: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  songId: number;
}): CollectionSongRelationshipRemoveOperation => ({
  collectionId,
  kind,
  songId,
});
