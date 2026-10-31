import type { PlaybackError } from "@synq/audio";
import { Alert } from "react-native";

import { errorFeedback } from "~/lib/haptics";
import { songTitle } from "./songs";
import { getPlayerState } from "./store";

/** Failures this close together are reported in one alert. */
const BATCH_MS = 800;

let pending = new Array<string | undefined>();
let timer: ReturnType<typeof setTimeout> | undefined;
/** Each entry (or session problem) is reported once. */
const reported = new Set<string>();

function title(titles: readonly (string | undefined)[]) {
  const [only] = titles;
  if (titles.length > 1) return `Couldn't Play ${titles.length} Songs`;
  return only === undefined ? "Couldn't Play Audio" : `Couldn't Play “${only}”`;
}

function flush() {
  const titles = pending;
  pending = [];
  timer = undefined;
  errorFeedback();
  Alert.alert(title(titles), "The file is missing or can't be played.");
}

/**
 * Native already moved past a song that can't play; this tells the person
 * once, quietly: one alert for a burst of failures (a folder of missing
 * files), never twice for the same entry, and nothing for the ad.
 */
export function reportPlaybackError(error: PlaybackError) {
  if (error.code === "interstitial-failed") return;
  const key = error.trackId ?? error.code;
  if (reported.has(key)) return;
  reported.add(key);
  const entry = getPlayerState().queue.entries.find(
    (item) => item.key === error.trackId,
  );
  pending.push(entry === undefined ? undefined : songTitle(entry.songId));
  timer ??= setTimeout(flush, BATCH_MS);
}
