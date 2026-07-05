import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getLibrarySongPreviewPlayerHref,
  type LibrarySongPreviewHref,
} from "./library-song-preview-navigation-service";

type LibrarySongPreviewPlaybackCommand = {
  haptic: HapticFeedbackType;
};

type LibrarySongPreviewPlayCommand = LibrarySongPreviewPlaybackCommand & {
  href: LibrarySongPreviewHref;
};

export const getLibrarySongPreviewPlayCommand =
  (): LibrarySongPreviewPlayCommand => ({
    haptic: "light",
    href: getLibrarySongPreviewPlayerHref(),
  });

export const getLibrarySongPreviewQueueCommand =
  (): LibrarySongPreviewPlaybackCommand => ({
    haptic: "light",
  });
