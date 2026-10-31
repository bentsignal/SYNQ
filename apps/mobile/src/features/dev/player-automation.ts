import * as Audio from "@synq/audio";

import type { PlaybackSource } from "~/features/player/types";
import { setAdThresholdForDevelopment } from "~/features/player/ad-config";
import {
  addToQueue,
  clearUpNext,
  cycleRepeat,
  moveInQueue,
  playNext,
  playQueueIndex,
  playSongs,
  removeFromQueue,
  seekTo,
  skipToNext,
  skipToPrevious,
  togglePlayback,
  toggleShuffle,
} from "~/features/player/commands";
import { getPlayerState } from "~/features/player/store";
import { seedPlayer } from "./player-seed";

/**
 * `synqDev.player` (development builds): drive playback from
 * `scripts/sim.sh eval`. Hermes's debugger can't wait on a promise, so
 * async results land in `synqDev.player.last` for the next eval to read.
 */
const results = { last: asUnknown(undefined) };

function asUnknown(value: unknown) {
  return value;
}

const automation = {
  get last() {
    return results.last;
  },
  /** Imports the sample songs (`dev/player-sample/push.sh` first). */
  seed(fillers = 0) {
    results.last = "seeding";
    void seedPlayer({ fillers }).then(
      (ids) => (results.last = ids),
      (error: unknown) => (results.last = String(error)),
    );
  },
  play(
    songIds: number[],
    options: { startIndex?: number; shuffle?: boolean } = {},
  ) {
    const source = { kind: "library" } satisfies PlaybackSource;
    playSongs(songIds, { ...options, source });
  },
  playNext,
  addToQueue,
  toggle: togglePlayback,
  next: skipToNext,
  previous: skipToPrevious,
  seek(ms: number) {
    void seekTo(ms);
  },
  skipTo: playQueueIndex,
  move: moveInQueue,
  remove: removeFromQueue,
  clear: clearUpNext,
  shuffle: toggleShuffle,
  repeat: cycleRepeat,
  /** Hear the ad sooner (this run of the app only). */
  adAfter: setAdThresholdForDevelopment,
  /** The JavaScript queue, as song ids, and where it is. */
  state() {
    const state = getPlayerState();
    return {
      current: state.current,
      interstitial: state.interstitial,
      queue: state.queue.entries.map((entry) => entry.songId),
      repeat: state.repeat,
      shuffle: state.shuffle,
      source: state.source,
      status: state.status,
    };
  },
  /** Native's state and queue, into `last`. */
  native() {
    void Promise.all([Audio.getState(), Audio.getQueue()]).then(
      ([state, queue]) =>
        (results.last = {
          queue: queue.tracks.map((track) => track.id),
          state,
        }),
    );
  },
};

export const playerAutomation = automation;
