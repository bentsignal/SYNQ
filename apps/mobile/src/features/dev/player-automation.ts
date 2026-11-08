import * as Audio from "@synq/audio";

import type { PlaybackSource } from "~/features/player/types";
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
import { getPlayerState, setPlayerState } from "~/features/player/store";
import { seedPlayer } from "./player-seed";
import { driveQueueDrag } from "./queue-drag-control";

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
  /**
   * What the app shows for a skip to `index`, without telling native, so
   * nothing starts playing: for checking the queue's rows in a simulator
   * without sound. Native's queue is left behind; `skipTo` or a relaunch
   * puts them back together.
   */
  showSkip(index: number) {
    const { queue } = getPlayerState();
    const entry = queue.entries[index];
    if (entry !== undefined) {
      setPlayerState({ queue: { ...queue, currentKey: entry.key } });
    }
  },
  move: moveInQueue,
  /** With the queue open: a drag of the row at `index` (see queue-drag-driver). */
  drag: driveQueueDrag,
  remove: removeFromQueue,
  clear: clearUpNext,
  shuffle: toggleShuffle,
  repeat: cycleRepeat,
  /** The JavaScript queue, as song ids, and where it is. */
  state() {
    const state = getPlayerState();
    return {
      current: state.current,
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
