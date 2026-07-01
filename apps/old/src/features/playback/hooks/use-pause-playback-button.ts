import { useCallback, useEffect, useRef, useState } from "react";
import { State, usePlaybackState } from "react-native-track-player";

import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import {
  shouldShowPlayButton,
  togglePlaybackForState,
} from "@/src/features/playback/lib/playback-toggle-command-service";

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
    sendHaptic("soft");
    await togglePlaybackForState(currentState);
  }, [currentState, sendHaptic]);

  const showPlayButton = shouldShowPlayButton({
    currentState,
    previousState: previousState.current,
  });

  return {
    showPlayButton,
    togglePlayback,
  };
};
