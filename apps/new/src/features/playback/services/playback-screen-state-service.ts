import { formatDurationMs } from "../../app-shell/services/duration-format-service";
import type { PlaybackState } from "../types/playback-state";

export type PlaybackHref = "/player" | "/premium" | "/queue";

export const getPlaybackPlayerHref = (): PlaybackHref => "/player";

export const getPlaybackPremiumHref = (): PlaybackHref => "/premium";

export const getPlaybackQueueHref = (): PlaybackHref => "/queue";

export const getPlaybackPlayerScreenState = () => ({
  header: {
    kicker: "Now Playing",
    subtitle:
      "Control playback, queue movement, shuffle, repeat, and free-listening ad breaks.",
    title: "Player",
  },
  queueLink: {
    href: getPlaybackQueueHref(),
    label: "Open queue",
  },
});

export type PlaybackPlayerScreenState = ReturnType<
  typeof getPlaybackPlayerScreenState
>;

export type PlaybackPlayerHeaderState = PlaybackPlayerScreenState["header"];

export type PlaybackQueueLink = PlaybackPlayerScreenState["queueLink"];

export const getPlaybackAdBreakPanelState = ({
  state,
}: {
  state: PlaybackState;
}) => ({
  action: {
    href: getPlaybackPremiumHref(),
    label: "Open Premium",
  },
  body:
    "Free playback pauses after 10 minutes of listening. The ad will resume your song when it finishes, or you can open Premium for ad-free listening.",
  kicker: "Premium gate",
  progressLabel: `${formatDurationMs(state.adGate.playbackPosition)} / ${formatDurationMs(
    state.adGate.playbackDuration,
  )}`,
  title: "Ad break required",
});
