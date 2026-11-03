import { recordLikedPlayed, recordPlayed } from "@synq/db";

import type { PlaybackSource } from "./types";
import { libraryDb } from "~/features/library/database";
import { RECENTS_KEY } from "~/features/library/home-queries";
import { refreshLibraryQuery } from "~/features/library/queries";
import { playedItem } from "./played-item";

/**
 * Brings what's playing to the top of Recents. Only Recents reads this, so
 * unlike other writes it refreshes only Recents: a play shouldn't reread every
 * list on screen. It's a nicety, so a failure must never stop the music.
 */
export function recordPlay(
  source: PlaybackSource,
  chosenSongId: number | undefined,
) {
  const item = playedItem(source, chosenSongId);
  if (item === null) return;
  try {
    if (item.kind === "liked") recordLikedPlayed(libraryDb());
    else recordPlayed(libraryDb(), item);
    refreshLibraryQuery(RECENTS_KEY);
  } catch (error) {
    console.warn("Couldn't record a play", error);
  }
}
