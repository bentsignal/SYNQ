import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getLibrarySongPreviewPlayCommand,
  getLibrarySongPreviewQueueCommand,
} from "./library-song-preview-command-state-service";
import type { LibrarySongPreviewHref } from "./library-song-preview-navigation-service";
import type { LibrarySongPreviewPlaybackItem } from "./library-song-preview-playback-item-service";

type HapticSender = (type: HapticFeedbackType) => void;

type NativeRoutePusher = (href: LibrarySongPreviewHref) => void;

export const runLibrarySongPreviewPlayAction = ({
  playbackItem,
  playSong,
  pushRoute,
  sendHaptic,
}: {
  playbackItem: LibrarySongPreviewPlaybackItem;
  playSong: (song: LibrarySongPreviewPlaybackItem) => void;
  pushRoute: NativeRoutePusher;
  sendHaptic: HapticSender;
}) => {
  const command = getLibrarySongPreviewPlayCommand();
  sendHaptic(command.haptic);
  playSong(playbackItem);
  pushRoute(command.href);
};

export const runLibrarySongPreviewQueueAction = ({
  addToQueue,
  playbackItem,
  sendHaptic,
}: {
  addToQueue: (song: LibrarySongPreviewPlaybackItem) => void;
  playbackItem: LibrarySongPreviewPlaybackItem;
  sendHaptic: HapticSender;
}) => {
  sendHaptic(getLibrarySongPreviewQueueCommand().haptic);
  addToQueue(playbackItem);
};
