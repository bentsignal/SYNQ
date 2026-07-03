import { useEffect, useRef } from "react";
import {
  createExpoAudioTrackPlayerAdapter,
  type TrackPlayerAdapter,
} from "../services/track-player-adapter";

export function usePlaybackNativeAdapter(): TrackPlayerAdapter {
  const adapterRef = useRef(createExpoAudioTrackPlayerAdapter());

  useEffect(
    () => () => {
      void adapterRef.current.destroy();
    },
    [],
  );

  return adapterRef.current;
}
