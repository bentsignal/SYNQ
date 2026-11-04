import { recordLikedPlayed, recordPlayed } from "@synq/db";

import type { PlaybackSource } from "./types";
import { libraryDb } from "~/features/library/database";
import { RECENTS_KEY } from "~/features/library/home-queries";
import { refreshLibraryQuery } from "~/features/library/queries";
import { createHeldPlays } from "./held-plays";
import { playedItem } from "./played-item";

/**
 * Longer than any way off the tab takes to animate. A timer because the stack's
 * transition events only cover pushes in its own stack, not another tab or the
 * player's sheet. Coming back sooner just leaves the list as it was.
 */
const TAB_OFF_SCREEN_AFTER_MS = 1000;

type PlayedItem = NonNullable<ReturnType<typeof playedItem>>;

/**
 * Only Recents reads plays, so unlike other writes this refreshes only Recents:
 * a play shouldn't reread every list on screen. It's a nicety, so a failure must
 * never stop the music.
 */
const plays = createHeldPlays<PlayedItem>({
  afterLeaving: (then) => {
    const timer = setTimeout(then, TAB_OFF_SCREEN_AFTER_MS);
    return () => {
      clearTimeout(timer);
    };
  },
  show: () => {
    refreshLibraryQuery(RECENTS_KEY);
  },
  write: (batch) => {
    try {
      const db = libraryDb();
      for (const { at, item } of batch) {
        if (item.kind === "liked") recordLikedPlayed(db, { now: at });
        else recordPlayed(db, item, { now: at });
      }
    } catch (error) {
      console.warn("Couldn't record a play", error);
    }
  },
});

/** The Library tab came on screen; `isAtTop` says whether its list is at the very top. */
export function playsArrive(isAtTop: () => boolean) {
  plays.arrive(isAtTop);
}

/** The Library tab went off screen. */
export function playsLeave() {
  plays.leave();
}

/** The app went to the background. */
export function playsBackground() {
  plays.background();
}

/** Notes what's now playing, for Recents. */
export function recordPlay(
  source: PlaybackSource,
  chosenSongId: number | undefined,
) {
  const item = playedItem(source, chosenSongId);
  if (item !== null) plays.record(item, Date.now());
}
