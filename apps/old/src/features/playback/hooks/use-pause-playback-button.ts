import { useCallback, useEffect, useRef, useState } from "react";
import { State, usePlaybackState } from "react-native-track-player";

import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import usePlayer from "@/src/features/playback/hooks/use-player";

export const usePausePlaybackButton = () => {
  const { sendHaptic } = useHaptics();
  const { togglePlayback: togglePlayerPlayback } = usePlayer();

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
      await togglePlayerPlayback(currentState);
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }
  }, [currentState, sendHaptic, togglePlayerPlayback]);

  const showPlayButton =
    [State.Paused, State.Ready].includes(currentState) &&
    ![State.Loading, State.Buffering].includes(previousState.current);

  return {
    showPlayButton,
    togglePlayback,
  };
};
