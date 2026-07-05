import type { SongAddToPlaylistMutationState } from "./song-add-to-playlist-mutation-state-service";

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
