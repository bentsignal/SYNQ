import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";

export type SongAddToPlaylistMutationState = {
  error: unknown;
  pendingPlaylistId: number | null;
  successPlaylistId: number | null;
};

export type SongAddToPlaylistMutationAction = {
  state: SongAddToPlaylistMutationState;
  type: "set";
};

export const initialSongAddToPlaylistMutationState: SongAddToPlaylistMutationState =
  {
    error: null,
    pendingPlaylistId: null,
    successPlaylistId: null,
  };

export const getSetSongAddToPlaylistMutationAction = (
  state: SongAddToPlaylistMutationState,
): SongAddToPlaylistMutationAction => ({
  state,
  type: "set",
});

export const songAddToPlaylistMutationReducer = (
  _state: SongAddToPlaylistMutationState,
  action: SongAddToPlaylistMutationAction,
): SongAddToPlaylistMutationState => {
  switch (action.type) {
    case "set":
      return action.state;
  }
};

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
