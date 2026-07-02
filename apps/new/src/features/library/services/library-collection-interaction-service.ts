import type {
  LibraryCollectionDetailKind,
  LibraryCollectionDetailSong,
} from "./library-collection-detail-service";
import { likedSongsPlaylistId } from "./library-playlist-constants-service";

export type LibraryCollectionListHref =
  | "/(tabs)/library"
  | "/(tabs)/library/albums"
  | "/(tabs)/library/artists"
  | "/(tabs)/library/playlists";

export type LibraryCollectionActionHref =
  | `/(tabs)/library/${LibraryCollectionDetailKind}/add/${number}`
  | `/(tabs)/library/${LibraryCollectionDetailKind}/edit/${number}`;

export const getLibraryCollectionBackHref = (): LibraryCollectionListHref =>
  "/(tabs)/library";

export const getCollectionListHref = (
  kind: LibraryCollectionDetailKind,
): LibraryCollectionListHref => {
  switch (kind) {
    case "album":
      return "/(tabs)/library/albums";
    case "artist":
      return "/(tabs)/library/artists";
    case "playlist":
    default:
      return "/(tabs)/library/playlists";
  }
};

export const getCollectionEditHref = ({
  id,
  kind,
}: {
  id: number;
  kind: LibraryCollectionDetailKind;
}): LibraryCollectionActionHref => `/(tabs)/library/${kind}/edit/${id}`;

export const getCollectionAddSongsHref = ({
  id,
  kind,
}: {
  id: number;
  kind: LibraryCollectionDetailKind;
}): LibraryCollectionActionHref => `/(tabs)/library/${kind}/add/${id}`;

export const getLibraryCollectionSongEmptyState = () => ({
  body: "Add songs from your library to build this collection.",
  title: "No songs here yet",
});

export const getLibraryInvalidCollectionState = ({
  kicker = "Library",
}: {
  kicker?: string;
} = {}) => ({
  backLink: {
    href: getLibraryCollectionBackHref(),
    label: "Back to Library",
  },
  body: "This route needs a numeric id.",
  kicker,
  title: "Invalid collection",
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

export const canDeleteLibraryCollection = ({
  id,
  isMissing,
  kind,
}: {
  id: number;
  isMissing: boolean;
  kind: LibraryCollectionDetailKind;
}) =>
  !isMissing && (kind !== "playlist" || (id !== 1 && id !== likedSongsPlaylistId));

export const getPlayableCollectionSongs = (
  songs: LibraryCollectionDetailSong[],
) => songs.filter((song) => song.pathToFile !== null);

export const getCollectionDetailActionState = ({
  id,
  isDeleting,
  isExporting,
  isMissing,
  kind,
  songs,
}: {
  id: number;
  isDeleting: boolean;
  isExporting: boolean;
  isMissing: boolean;
  kind: LibraryCollectionDetailKind;
  songs: LibraryCollectionDetailSong[];
}) => {
  const playableSongs = getPlayableCollectionSongs(songs);
  const hasPlayableSongs = playableSongs.length > 0;
  const canDeleteCollection = canDeleteLibraryCollection({
    id,
    isMissing,
    kind,
  });

  return {
    canDelete: canDeleteCollection && !isDeleting,
    canExport: hasPlayableSongs && !isExporting,
    canPlay: hasPlayableSongs,
    canQueue: hasPlayableSongs,
    deleteLabel: isDeleting ? "Deleting" : "Delete",
    exportLabel: isExporting ? "Exporting" : "Export",
    playableSongs,
  };
};

export type CollectionDetailActionState = ReturnType<
  typeof getCollectionDetailActionState
>;

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
