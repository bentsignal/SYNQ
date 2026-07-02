import { PlaybackPlayerScreenView } from "../components/PlaybackPlayerScreenView";
import { usePlaybackPlayerController } from "../hooks/use-playback-player-controller";

export function PlaybackPlayerScreen() {
  const controller = usePlaybackPlayerController();

  return <PlaybackPlayerScreenView {...controller} />;
}
