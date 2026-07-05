import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getLibrarySongPlaybackBlockedCommand,
  getLibrarySongPlayCommand,
  getLibrarySongQueueCommand,
} from "./library-song-playback-state-service";
import type { LibrarySongDetailPlaybackItem } from "./library-song-playback-item-service";
import type { LibrarySongDetailHref } from "./library-song-navigation-service";

type LibrarySongPlaybackActionDependencies = {
  addToQueue: (song: LibrarySongDetailPlaybackItem) => void;
  playSong: (song: LibrarySongDetailPlaybackItem) => void;
  pushRoute: (href: LibrarySongDetailHref) => void;
  sendHaptic: (type: HapticFeedbackType) => void;
};

export const runLibrarySongPlayAction = ({
  canPlay,
  playbackItem,
  playSong,
  pushRoute,
  sendHaptic,
}: Pick<
  LibrarySongPlaybackActionDependencies,
  "playSong" | "pushRoute" | "sendHaptic"
> & {
  canPlay: boolean;
  playbackItem: LibrarySongDetailPlaybackItem;
}) => {
  if (!canPlay) {
    sendHaptic(getLibrarySongPlaybackBlockedCommand().haptic);
    return;
  }

  const command = getLibrarySongPlayCommand();
  sendHaptic(command.haptic);
  playSong(playbackItem);
  pushRoute(command.href);
};

export const runLibrarySongQueueAction = ({
  addToQueue,
  canPlay,
  playbackItem,
  sendHaptic,
}: Pick<
  LibrarySongPlaybackActionDependencies,
  "addToQueue" | "sendHaptic"
> & {
  canPlay: boolean;
  playbackItem: LibrarySongDetailPlaybackItem;
}) => {
  if (!canPlay) {
    sendHaptic(getLibrarySongPlaybackBlockedCommand().haptic);
    return;
  }

  sendHaptic(getLibrarySongQueueCommand().haptic);
  addToQueue(playbackItem);
};
