import { pushNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import type { LibrarySongPreview } from "../services/library-song-preview-service";
import {
  type LibrarySongPreviewPlaybackItem,
  toLibrarySongPlaybackItem,
} from "../services/library-song-preview-state-service";
import {
  runLibrarySongPreviewPlayAction,
  runLibrarySongPreviewQueueAction,
} from "../services/library-song-preview-action-flow-service";

type UseLibrarySongPreviewRowActionsParams = {
  addToQueue: (song: LibrarySongPreviewPlaybackItem) => void;
  playSong: (song: LibrarySongPreviewPlaybackItem) => void;
  song: LibrarySongPreview;
};

export function useLibrarySongPreviewRowActions({
  addToQueue,
  playSong,
  song,
}: UseLibrarySongPreviewRowActionsParams) {
  const { sendHaptic } = useHapticFeedback();
  const playbackItem = toLibrarySongPlaybackItem(song);

  const play = () => {
    runLibrarySongPreviewPlayAction({
      playbackItem,
      playSong,
      pushRoute: pushNativeRoute,
      sendHaptic,
    });
  };

  const queue = () => {
    runLibrarySongPreviewQueueAction({
      addToQueue,
      playbackItem,
      sendHaptic,
    });
  };

  return {
    play,
    queue,
  };
}
