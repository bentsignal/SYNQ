import type { AddCollectionSongsMutationKind } from "./add-collection-songs-state-service";

export const getAddCollectionSongsMutationErrorMessage = ({
  caughtError,
  mutation,
}: {
  caughtError: unknown;
  mutation: AddCollectionSongsMutationKind;
}) => {
  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  switch (mutation) {
    case "add-selection":
      return "Selected songs could not be added.";
    case "add-song":
      return "Song could not be added.";
  }
};
