import type { LibrarySongDetail } from "./library-song-detail-types-service";
import { getLibrarySongEditFieldState } from "./library-song-edit-field-state-service";
import { getLibrarySongEditStatusState } from "./library-song-edit-status-state-service";

export const getLibrarySongEditScreenViewState = ({
  detail,
  errors,
  mutationError,
}: {
  detail: LibrarySongDetail;
  errors: readonly unknown[];
  mutationError: string | null;
}) => ({
  fieldState: getLibrarySongEditFieldState(),
  statusState: getLibrarySongEditStatusState({
    detail,
    errors,
    mutationError,
  }),
});

export type LibrarySongEditScreenViewState = ReturnType<
  typeof getLibrarySongEditScreenViewState
>;
