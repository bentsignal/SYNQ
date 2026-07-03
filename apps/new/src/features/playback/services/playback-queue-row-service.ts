import { formatDurationMs } from "../../app-shell/services/duration-format-service";
import type { PlaybackQueueItem } from "../types/playback-state";

export const getPlaybackQueueRowState = ({
  activeTrackId,
  adBreakActive,
  index,
  queueLength,
  songId,
}: {
  activeTrackId: number | null;
  adBreakActive: boolean;
  index: number;
  queueLength: number;
  songId: number;
}) => ({
  canMoveDown: index < queueLength - 1,
  canMoveUp: index > 0,
  canPlay: !adBreakActive,
  isActive: activeTrackId === songId,
});

export const getPlaybackQueueRowPresentation = ({
  activeTrackId,
  adBreakActive,
  index,
  queueLength,
  song,
}: {
  activeTrackId: number | null;
  adBreakActive: boolean;
  index: number;
  queueLength: number;
  song: PlaybackQueueItem;
}) => ({
  ...getPlaybackQueueRowState({
    activeTrackId,
    adBreakActive,
    index,
    queueLength,
    songId: song.id,
  }),
  durationLabel: formatDurationMs(song.duration),
  indexLabel: String(index + 1),
  metadataLabel: `${song.artist} / ${song.album}`,
  moveDownAccessibilityLabel: `Move ${song.title} down`,
  moveDownLabel: "Down",
  moveUpAccessibilityLabel: `Move ${song.title} up`,
  moveUpLabel: "Up",
  removeLabel: "Remove",
});

export type PlaybackQueueRowPresentation = ReturnType<
  typeof getPlaybackQueueRowPresentation
>;
