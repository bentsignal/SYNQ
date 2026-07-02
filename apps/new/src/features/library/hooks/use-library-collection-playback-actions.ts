import { router } from "expo-router";
import { usePlaybackSession } from "@/src/features/playback/hooks/use-playback-session";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  getCollectionPlaybackCommandPlan,
  getCollectionQueueCommandPlan,
} from "../services/library-collection-playback-service";
import type { CollectionDetailActionState } from "../services/library-collection-interaction-service";

type UseLibraryCollectionPlaybackActionsParams = {
  actionState: CollectionDetailActionState;
};

export function useLibraryCollectionPlaybackActions({
  actionState,
}: UseLibraryCollectionPlaybackActionsParams) {
  const { addToQueue, playSong } = usePlaybackSession();
  const { sendHaptic } = useHapticFeedback();

  const playCollection = () => {
    const playbackPlan = getCollectionPlaybackCommandPlan({
      playableSongs: actionState.playableSongs,
    });

    sendHaptic(playbackPlan.haptic);

    if (!playbackPlan.firstSong || !playbackPlan.playerHref) {
      return;
    }

    playSong(playbackPlan.firstSong);
    playbackPlan.queuedSongs.forEach(addToQueue);
    router.push(playbackPlan.playerHref);
  };

  const queueCollection = () => {
    const queuePlan = getCollectionQueueCommandPlan({
      canQueue: actionState.canQueue,
      playableSongs: actionState.playableSongs,
    });

    sendHaptic(queuePlan.haptic);

    if (queuePlan.queuedSongs.length === 0) {
      return;
    }

    queuePlan.queuedSongs.forEach(addToQueue);
  };

  return {
    playCollection,
    queueCollection,
  };
}
