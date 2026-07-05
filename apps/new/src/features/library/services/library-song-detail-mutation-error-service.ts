import type { LibrarySongDetailMutationKind } from "./library-song-detail-mutation-service";

export const getLibrarySongDetailMutationErrorMessage = ({
  caughtError,
  mutation,
}: {
  caughtError: unknown;
  mutation: LibrarySongDetailMutationKind;
}) => {
  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  switch (mutation) {
    case "delete-song":
      return "Song could not be deleted.";
    case "export-song":
      return "Song could not be exported.";
    case "toggle-liked":
      return "Liked Songs could not be updated.";
  }
};
