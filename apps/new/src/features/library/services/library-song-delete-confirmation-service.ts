import type { LibrarySongDetail } from "./library-song-detail-service";

export const getLibrarySongDeleteConfirmationCopy = (
  detail: LibrarySongDetail,
) => ({
  body: `Delete ${detail.title}?`,
  cancelLabel: "Cancel",
  confirmLabel: "Delete",
  title: "Delete song",
});
