import type { LibrarySongDetail } from "./library-song-detail-types-service";
import { getLibrarySongDetailHref } from "./library-song-navigation-service";

export const getLibrarySongEditActionState = ({
  detail,
  isSaving,
  songId,
  title,
}: {
  detail: LibrarySongDetail;
  isSaving: boolean;
  songId: number;
  title: string;
}) => ({
  cancelHref: getLibrarySongDetailHref({ songId }),
  canPickCoverImage: !detail.isMissing && !isSaving,
  canSave: !detail.isMissing && title.trim().length > 0 && !isSaving,
  saveLabel: isSaving ? "Saving" : "Save",
});

export type LibrarySongEditActionState = ReturnType<
  typeof getLibrarySongEditActionState
>;
