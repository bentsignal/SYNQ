import { togglePlaybackState } from "@/src/features/playback/lib/playback-transport-service";
import { State } from "react-native-track-player";

export const togglePlaybackForState = async (currentState: State) => {
  try {
    await togglePlaybackState(currentState);

    return true;
  } catch {
    return false;
  }
};

export const shouldShowPlayButton = ({
  currentState,
  previousState,
}: {
  currentState: State;
  previousState: State;
}) => {
  return (
    [State.Paused, State.Ready].includes(currentState) &&
    ![State.Loading, State.Buffering].includes(previousState)
  );
};
