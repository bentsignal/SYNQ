import type { LibrarySongDetail } from "./library-song-detail-types-service";

export const getLibrarySongDeleteConfirmationCopy = (
  detail: LibrarySongDetail,
) => ({
  body: `Delete ${detail.title}?`,
  cancelLabel: "Cancel",
  confirmLabel: "Delete",
  title: "Delete song",
});
