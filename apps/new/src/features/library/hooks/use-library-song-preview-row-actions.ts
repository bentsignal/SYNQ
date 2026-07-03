import { pushNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import type { LibrarySongPreview } from "../services/library-song-preview-service";
import {
  getLibrarySongPreviewPlayCommand,
  getLibrarySongPreviewQueueCommand,
  type LibrarySongPreviewPlaybackItem,
  toLibrarySongPlaybackItem,
} from "../services/library-song-preview-state-service";

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
    const command = getLibrarySongPreviewPlayCommand();
    sendHaptic(command.haptic);
    playSong(playbackItem);
    pushNativeRoute(command.href);
  };

  const queue = () => {
    sendHaptic(getLibrarySongPreviewQueueCommand().haptic);
    addToQueue(playbackItem);
  };

  return {
    play,
    queue,
  };
}
