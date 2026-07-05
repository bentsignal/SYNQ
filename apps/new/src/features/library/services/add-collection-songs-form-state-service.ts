import type { AddCollectionSongsCollectionKind } from "./add-collection-songs-kind-service";
import { getAddCollectionSongsBackLink } from "./add-collection-songs-navigation-service";

export const getAddCollectionSongsHeaderState = ({
  kind,
}: {
  kind: AddCollectionSongsCollectionKind;
}) => ({
  kicker: "Add songs",
  searchInput: {
    placeholder: "Search songs, artists, or albums",
    returnKeyType: "search" as const,
  },
  subtitle: "Search your songs and add them to this collection.",
  title: `Add to ${kind}`,
});

export const getAddCollectionSongsFormState = ({
  collectionId,
  kind,
}: {
  collectionId: number;
  kind: AddCollectionSongsCollectionKind;
}) => ({
  backLink: getAddCollectionSongsBackLink({ collectionId, kind }),
  header: getAddCollectionSongsHeaderState({ kind }),
});

export type AddCollectionSongsFormState = ReturnType<
  typeof getAddCollectionSongsFormState
>;
