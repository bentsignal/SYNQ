import { PlaybackQueueScreenView } from "../components/PlaybackQueueScreenView";
import { usePlaybackQueueController } from "../hooks/use-playback-queue-controller";

export function PlaybackQueueScreen() {
  return <PlaybackQueueScreenView {...usePlaybackQueueController()} />;
}
