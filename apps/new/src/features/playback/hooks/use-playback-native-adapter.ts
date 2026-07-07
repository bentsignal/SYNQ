import { useEffect, useState } from "react";
import {
  createExpoAudioTrackPlayerAdapter,
  type TrackPlayerAdapter,
} from "../services/track-player-adapter";

export function usePlaybackNativeAdapter(): TrackPlayerAdapter {
  const [adapter] = useState(createExpoAudioTrackPlayerAdapter);

  useEffect(
    () => () => {
      void adapter.destroy();
    },
    [adapter],
  );

  return adapter;
}
