import { useCallback, useEffect, useRef, useState } from "react";
import { State, usePlaybackState } from "react-native-track-player";

import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { togglePlaybackState } from "@/src/features/playback/lib/playback-transport-service";

export const usePausePlaybackButton = () => {
  const { sendHaptic } = useHaptics();

  const playbackState = usePlaybackState();
  const [currentState, setCurrentState] = useState(
    playbackState.state ?? State.None,
  );
  const previousState = useRef(State.Playing);

  useEffect(() => {
    setCurrentState((state) => {
      previousState.current = state;
      return playbackState.state ?? State.None;
    });
  }, [playbackState.state]);

  const togglePlayback = useCallback(async () => {
    try {
      sendHaptic("soft");
      await togglePlaybackState(currentState);
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }
  }, [currentState, sendHaptic]);

  const showPlayButton =
    [State.Paused, State.Ready].includes(currentState) &&
    ![State.Loading, State.Buffering].includes(previousState.current);

  return {
    showPlayButton,
    togglePlayback,
  };
};
