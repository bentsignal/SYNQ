import type { CollectionDetailMutationKind } from "./library-collection-mutation-state-service";

export const getCollectionDetailMutationErrorMessage = ({
  caughtError,
  mutation,
}: {
  caughtError: unknown;
  mutation: CollectionDetailMutationKind;
}) => {
  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  switch (mutation) {
    case "delete-collection":
      return "Collection could not be deleted.";
    case "export-collection":
      return "Songs could not be exported.";
    case "move-song":
      return "Song order could not be saved.";
    case "remove-song":
      return "Song could not be removed.";
  }
};
