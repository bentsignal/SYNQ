import type { LibraryCollectionPreview } from "./library-collection-preview-service";
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
