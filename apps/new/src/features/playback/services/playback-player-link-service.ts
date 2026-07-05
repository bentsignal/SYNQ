import {
  getLibrarySongDetailHref,
  getLibrarySongEditHref,
} from "../../library/services/library-song-navigation-service";
import type { PlaybackPlayerActionState } from "./playback-player-action-state-service";

export type PlaybackPlayerLink = {
  href: string;
  label: string;
};

export const getPlaybackPlayerActiveTrackLinks = ({
  actionState,
  activeTrackId,
}: {
  actionState: PlaybackPlayerActionState;
  activeTrackId: number | null;
}) => ({
  activeTrackDetailLink:
    activeTrackId !== null && actionState.canOpenActiveTrackDetails
      ? {
          href: getLibrarySongDetailHref({ songId: activeTrackId }),
          label: "Song details",
        }
      : null,
  activeTrackEditLink:
    activeTrackId !== null && actionState.canEditActiveTrack
      ? {
          href: getLibrarySongEditHref({ songId: activeTrackId }),
          label: "Edit song",
        }
      : null,
});
