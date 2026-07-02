import type { LibrarySongDetail } from "./library-song-detail-service";

export type LibrarySongEditFormState = {
  albumNames: string;
  artistNames: string;
  title: string;
};

export const buildLibrarySongEditFormState = (
  detail: LibrarySongDetail,
): LibrarySongEditFormState => ({
  albumNames: detail.albumLabel === "Unknown" ? "" : detail.albumLabel,
  artistNames: detail.artistLabel === "Unknown" ? "" : detail.artistLabel,
  title: detail.isMissing ? "" : detail.title,
});

export const getLibrarySongEditActionState = ({
  detail,
  isSaving,
  title,
}: {
  detail: LibrarySongDetail;
  isSaving: boolean;
  title: string;
}) => ({
  canSave: !detail.isMissing && title.trim().length > 0 && !isSaving,
  saveLabel: isSaving ? "Saving" : "Save",
});
