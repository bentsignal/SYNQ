import { usePlaybackAdTimingEffects } from "@/src/features/playback/hooks/use-playback-ad-timing-effects";
import { usePlaybackPersistenceEffects } from "@/src/features/playback/hooks/use-playback-persistence-effects";
import { usePlaybackRemoteEvents } from "@/src/features/playback/hooks/use-playback-remote-events";
import { useActiveTrack, useProgress } from "react-native-track-player";

export const useHomePlaybackEffects = () => {
  const track = useActiveTrack();
  const { position, duration } = useProgress();

  usePlaybackPersistenceEffects({ position, track });
  usePlaybackAdTimingEffects({ duration, position, track });
  usePlaybackRemoteEvents({ track });
};
