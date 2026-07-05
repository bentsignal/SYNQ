import type { AddCollectionSongsCollectionKind } from "./add-collection-songs-kind-service";

export const getAddCollectionSongsBackHref = ({
  collectionId,
  kind,
}: {
  collectionId: number;
  kind: AddCollectionSongsCollectionKind;
}) => `/(tabs)/library/${kind}/${collectionId}` as const;

export const getAddCollectionSongsBackLink = ({
  collectionId,
  kind,
}: {
  collectionId: number;
  kind: AddCollectionSongsCollectionKind;
}) => ({
  href: getAddCollectionSongsBackHref({ collectionId, kind }),
  label: "Back to collection",
});
