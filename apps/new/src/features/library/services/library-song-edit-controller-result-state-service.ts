import type { LibrarySongDetail } from "./library-song-detail-types-service";
import { getLibrarySongEditActionState } from "./library-song-edit-action-state-service";
import type { LibrarySongEditControllerState } from "./library-song-edit-controller-reducer-service";

export const getLibrarySongEditControllerResultState = ({
  detail,
  formState,
  songId,
}: {
  detail: LibrarySongDetail;
  formState: LibrarySongEditControllerState;
  songId: number;
}) => ({
  actionState: getLibrarySongEditActionState({
    detail,
    isSaving: formState.isSaving,
    songId,
    title: formState.title,
  }),
  albumNames: formState.albumNames,
  artistNames: formState.artistNames,
  coverImage: formState.coverImage,
  errorMessage: formState.errorMessage,
  title: formState.title,
});

export type LibrarySongEditControllerResultState = ReturnType<
  typeof getLibrarySongEditControllerResultState
>;
