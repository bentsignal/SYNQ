import type { PlaybackAction } from "./playback-session-service";
import type { PlaybackState } from "../types/playback-state";

type PlaybackHydrateAction = Extract<PlaybackAction, { type: "hydrate" }>;
type PlaybackPersistenceDispatch = (action: PlaybackHydrateAction) => void;

export const runPlaybackHydrateCommand = async ({
  dispatch,
  isCurrent,
  loadPersistedPlaybackState,
  onRestorePlayingState,
}: {
  dispatch: PlaybackPersistenceDispatch;
  isCurrent: () => boolean;
  loadPersistedPlaybackState: () => Promise<PlaybackState>;
  onRestorePlayingState: (state: PlaybackState) => void;
}) => {
  const persistedState = await loadPersistedPlaybackState();
  if (!isCurrent()) {
    return false;
  }

  dispatch({ state: persistedState, type: "hydrate" });

  if (persistedState.isPlaying) {
    onRestorePlayingState(persistedState);
  }

  return true;
};

export const runPlaybackPersistenceCommand = async ({
  hasHydrated,
  lastPersistedAt,
  now,
  savePersistedPlaybackState,
  state,
}: {
  hasHydrated: boolean;
  lastPersistedAt: number;
  now: number;
  savePersistedPlaybackState: (state: PlaybackState) => Promise<void>;
  state: PlaybackState;
}) => {
  if (!hasHydrated) {
    return lastPersistedAt;
  }

  const shouldPersistImmediately = !state.isPlaying;
  const shouldPersistProgress = now - lastPersistedAt > 5000;

  if (!shouldPersistImmediately && !shouldPersistProgress) {
    return lastPersistedAt;
  }

  await savePersistedPlaybackState(state);
  return now;
};
