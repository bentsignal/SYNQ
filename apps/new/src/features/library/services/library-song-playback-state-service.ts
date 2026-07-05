import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getLibrarySongDetailPlayerHref,
  type LibrarySongDetailHref,
} from "./library-song-navigation-service";

type LibrarySongPlaybackCommand = {
  haptic: HapticFeedbackType;
};

type LibrarySongPlayCommand = LibrarySongPlaybackCommand & {
  href: LibrarySongDetailHref;
};

export const getLibrarySongPlaybackBlockedCommand =
  (): LibrarySongPlaybackCommand => ({
    haptic: "error",
  });

export const getLibrarySongPlayCommand = (): LibrarySongPlayCommand => ({
  haptic: "light",
  href: getLibrarySongDetailPlayerHref(),
});

export const getLibrarySongQueueCommand = (): LibrarySongPlaybackCommand => ({
  haptic: "light",
});
