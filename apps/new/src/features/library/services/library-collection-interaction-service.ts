import type {
  LibraryCollectionDetailSong,
} from "./library-collection-detail-service";
import { getLibraryCollectionBackHref } from "./library-collection-navigation-service";

export const getLibraryCollectionSongEmptyState = () => ({
  body: "Add songs from your library to build this collection.",
  title: "No songs here yet",
});

export const getCollectionDetailViewState = ({
  songs,
}: {
  songs: LibraryCollectionDetailSong[];
}) => ({
  backLink: {
    href: getLibraryCollectionBackHref(),
    label: "Back to Library",
  },
  songSection: {
    meta: `${songs.length} songs`,
    title: "Songs",
  },
});

export type CollectionDetailStatusState = {
  isError: boolean;
  statusLabel: string;
  updatedLabel: string;
};

export const getCollectionDetailStatusState = ({
  errors,
  formatUpdatedAt = (updatedAt) =>
    new Date(updatedAt).toLocaleTimeString(),
  mutationError,
  updatedAt,
}: {
  errors: readonly unknown[];
  formatUpdatedAt?: (updatedAt: number) => string;
  mutationError: string | null;
  updatedAt: number;
}): CollectionDetailStatusState => {
  const updatedLabel =
    updatedAt > 0
      ? `Updated ${formatUpdatedAt(updatedAt)}`
      : "Waiting for collection data";

  if (mutationError !== null) {
    return {
      isError: true,
      statusLabel: mutationError,
      updatedLabel,
    };
  }

  if (errors.length > 0) {
    return {
      isError: true,
      statusLabel: "One or more detail queries failed.",
      updatedLabel,
    };
  }

  return {
    isError: false,
    statusLabel: updatedLabel,
    updatedLabel,
  };
};

export const getDeleteCollectionConfirmationCopy = ({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) => ({
  cancelLabel: "Cancel",
  confirmLabel: "Delete",
  message: `Delete ${title}? Songs will stay in your library.`,
  title: `Delete ${eyebrow.toLowerCase()}`,
});
