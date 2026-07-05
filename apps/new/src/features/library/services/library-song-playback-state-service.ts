import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { LibrarySongDetail } from "./library-song-detail-service";
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

export const toLibrarySongDetailPlaybackItem = ({
  detail,
  songId,
}: {
  detail: LibrarySongDetail;
  songId: number;
}) => ({
  album: detail.albumLabel,
  artist: detail.artistLabel,
  duration: detail.duration,
  id: songId,
  pathToFile: detail.pathToFile,
  title: detail.title,
});

export type LibrarySongDetailPlaybackItem = ReturnType<
  typeof toLibrarySongDetailPlaybackItem
>;

export const toLibrarySongExportItem = ({
  detail,
  songId,
}: {
  detail: LibrarySongDetail;
  songId: number;
}) => ({
  id: songId,
  pathToFile: detail.pathToFile,
  title: detail.title,
});

export type LibrarySongExportItem = ReturnType<typeof toLibrarySongExportItem>;
