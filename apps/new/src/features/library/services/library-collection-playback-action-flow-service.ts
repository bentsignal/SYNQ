import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getCollectionPlaybackCommandPlan,
  getCollectionQueueCommandPlan,
} from "./library-collection-playback-service";
import type { CollectionDetailActionState } from "./library-collection-action-state-service";
import type { LibraryCollectionDetailSong } from "./library-collection-detail-service";

type LibraryCollectionPlaybackActionDependencies = {
  addToQueue: (song: LibraryCollectionDetailSong) => void;
  playSong: (song: LibraryCollectionDetailSong) => void;
  pushRoute: (href: "/player") => void;
  sendHaptic: (type: HapticFeedbackType) => void;
};

export const runLibraryCollectionPlayAction = ({
  actionState,
  addToQueue,
  playSong,
  pushRoute,
  sendHaptic,
}: LibraryCollectionPlaybackActionDependencies & {
  actionState: Pick<CollectionDetailActionState, "playableSongs">;
}) => {
  const playbackPlan = getCollectionPlaybackCommandPlan({
    playableSongs: actionState.playableSongs,
  });

  sendHaptic(playbackPlan.haptic);

  if (!playbackPlan.firstSong || !playbackPlan.playerHref) {
    return;
  }

  playSong(playbackPlan.firstSong);
  playbackPlan.queuedSongs.forEach(addToQueue);
  pushRoute(playbackPlan.playerHref);
};

export const runLibraryCollectionQueueAction = ({
  actionState,
  addToQueue,
  sendHaptic,
}: Pick<LibraryCollectionPlaybackActionDependencies, "addToQueue" | "sendHaptic"> & {
  actionState: Pick<CollectionDetailActionState, "canQueue" | "playableSongs">;
}) => {
  const queuePlan = getCollectionQueueCommandPlan({
    canQueue: actionState.canQueue,
    playableSongs: actionState.playableSongs,
  });

  sendHaptic(queuePlan.haptic);
  queuePlan.queuedSongs.forEach(addToQueue);
};
