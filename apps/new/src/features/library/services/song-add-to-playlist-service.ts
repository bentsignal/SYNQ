import type { LibraryCollectionPreview } from "./library-collection-preview-service";
import {
  getLibraryCollectionListErrors,
  getLibraryCollectionListState,
} from "./library-collection-list-service";
import { isProtectedPlaylistId } from "./library-playlist-constants-service";
import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getLibrarySongDetailHref,
  type LibrarySongDetailHref,
} from "./library-song-interaction-service";

export type SongAddToPlaylistMutationState = {
  error: unknown;
  pendingPlaylistId: number | null;
  successPlaylistId: number | null;
};

export const initialSongAddToPlaylistMutationState: SongAddToPlaylistMutationState =
  {
    error: null,
    pendingPlaylistId: null,
    successPlaylistId: null,
  };

export const getSongAddToPlaylistBackLink = ({
  songId,
}: {
  songId: number;
}): { href: LibrarySongDetailHref; label: string } => ({
  href: getLibrarySongDetailHref({ songId }),
  label: "Song details",
});

export const getSongAddToPlaylistCopy = () => ({
  emptyLabel: "No playlists available",
  kicker: "Library",
  placeholder: "Search playlists",
  title: "Add to playlist",
});

export const getSongAddToPlaylistErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Playlist could not be updated.";

export const getSongAddToPlaylistSuccessCommand = (): {
  haptic: HapticFeedbackType;
} => ({
  haptic: "success",
});

export const getSongAddToPlaylistFailureCommand = (): {
  haptic: HapticFeedbackType;
} => ({
  haptic: "error",
});

export const getSelectableSongPlaylists = (
  playlists: LibraryCollectionPreview[],
) => playlists.filter((playlist) => !isProtectedPlaylistId(playlist.id));

export const getSongAddToPlaylistHeaderState = ({
  songId,
}: {
  songId: number;
}) => ({
  backLink: getSongAddToPlaylistBackLink({ songId }),
  copy: getSongAddToPlaylistCopy(),
});

export const getSongAddToPlaylistRowState = ({
  mutationState,
  playlist,
}: {
  mutationState: SongAddToPlaylistMutationState;
  playlist: LibraryCollectionPreview;
}) => {
  const isPending = mutationState.pendingPlaylistId === playlist.id;
  const isAdded = mutationState.successPlaylistId === playlist.id;

  return {
    detailLabel: isPending ? "Adding" : playlist.detail,
    imageInitial: playlist.title.slice(0, 1).toUpperCase(),
    isAdded,
    isDisabled: isPending,
    isPending,
    metaLabel: isAdded ? "Added" : playlist.meta,
    playlist,
  };
};

export type SongAddToPlaylistRowState = ReturnType<
  typeof getSongAddToPlaylistRowState
>;

export const getSongAddToPlaylistStatusState = ({
  hasListErrors,
  listStatusLabel,
  mutationState,
  statusLabel,
}: {
  hasListErrors: boolean;
  listStatusLabel: string;
  mutationState: SongAddToPlaylistMutationState;
  statusLabel: string;
}) => {
  const hasError = mutationState.error !== null || hasListErrors;

  return {
    hasError,
    label: hasListErrors ? listStatusLabel : statusLabel,
  };
};

export type SongAddToPlaylistStatusState = ReturnType<
  typeof getSongAddToPlaylistStatusState
>;

export const getSongAddToPlaylistStatusLabel = ({
  mutationState,
  playlistCount,
  updatedAt,
}: {
  mutationState: SongAddToPlaylistMutationState;
  playlistCount: number;
  updatedAt: number;
}) => {
  if (mutationState.error) {
    return getSongAddToPlaylistErrorMessage(mutationState.error);
  }

  if (mutationState.pendingPlaylistId !== null) {
    return "Adding to playlist";
  }

  if (mutationState.successPlaylistId !== null) {
    return "Added to playlist";
  }

  if (playlistCount === 0) {
    return "Create a playlist before adding this song.";
  }

  return updatedAt > 0
    ? `Updated ${new Date(updatedAt).toLocaleTimeString()}`
    : "Waiting for library data";
};

export const getSongAddToPlaylistControllerViewState = ({
  collections,
  error,
  mutationState,
  query,
  songId,
  updatedAt,
}: {
  collections: LibraryCollectionPreview[];
  error: unknown;
  mutationState: SongAddToPlaylistMutationState;
  query: string;
  songId: number;
  updatedAt: number;
}) => {
  const playlists = getSelectableSongPlaylists(collections);
  const listState = getLibraryCollectionListState({
    collections: playlists,
    emptyLabel: getSongAddToPlaylistCopy().emptyLabel,
    errors: getLibraryCollectionListErrors(error),
    query,
    updatedAt,
  });
  const statusLabel = getSongAddToPlaylistStatusLabel({
    mutationState,
    playlistCount: playlists.length,
    updatedAt,
  });

  return {
    copy: getSongAddToPlaylistCopy(),
    headerState: getSongAddToPlaylistHeaderState({ songId }),
    listState,
    rowStates: listState.visibleCollections.map((playlist) =>
      getSongAddToPlaylistRowState({
        mutationState,
        playlist,
      }),
    ),
    statusState: getSongAddToPlaylistStatusState({
      hasListErrors: listState.hasErrors,
      listStatusLabel: listState.statusLabel,
      mutationState,
      statusLabel,
    }),
  };
};

export type SongAddToPlaylistControllerViewState = ReturnType<
  typeof getSongAddToPlaylistControllerViewState
>;
