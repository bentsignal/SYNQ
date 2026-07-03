import { pushNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import { usePlaybackSongActions } from "@/src/features/playback/hooks/use-playback-session-selectors";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  runLibraryCollectionPlayAction,
  runLibraryCollectionQueueAction,
} from "../services/library-collection-playback-action-flow-service";
import type { CollectionDetailActionState } from "../services/library-collection-action-state-service";

type UseLibraryCollectionPlaybackActionsParams = {
  actionState: CollectionDetailActionState;
};

export function useLibraryCollectionPlaybackActions({
  actionState,
}: UseLibraryCollectionPlaybackActionsParams) {
  const { addToQueue, playSong } = usePlaybackSongActions();
  const { sendHaptic } = useHapticFeedback();

  const playCollection = () => {
    runLibraryCollectionPlayAction({
      actionState,
      addToQueue,
      playSong,
      pushRoute: pushNativeRoute,
      sendHaptic,
    });
  };

  const queueCollection = () => {
    runLibraryCollectionQueueAction({
      actionState,
      addToQueue,
      sendHaptic,
    });
  };

  return {
    playCollection,
    queueCollection,
  };
}
