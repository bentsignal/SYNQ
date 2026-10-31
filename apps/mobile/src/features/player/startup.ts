import type { PlaybackState } from "@synq/audio";
import { AppState } from "react-native";
import { hashKey } from "@tanstack/react-query";
import * as Audio from "@synq/audio";

import type { PlayerSongs } from "./songs";
import { queryClient } from "~/lib/query-client";
import { configureAd } from "./ad-config";
import { forgetSongs } from "./commands";
import { reportPlaybackError } from "./errors";
import { pushedTrack, resyncNative } from "./native-queue";
import { noteNativeState, persist, restoreSession, saveFromNative } from "./persistence";
import { subscribePremiumTier } from "./premium-gate";
import { isSettingSongs, PLAYER_SONGS_QUERY } from "./songs";
import { getPlayerState, onFirstUse, setPlayerState } from "./store";
import { sameTrack, trackFor } from "./tracks";

/** While playing, the position is also saved this often. */
const SAVE_EVERY_MS = 15_000;

/**
 * Native's state: what's playing (by entry key; during the ad, by the
 * index of the entry after it), the status, and the ad. Every one is a
 * moment worth saving (pause, track change, the ad starting or ending).
 */
function onNativeState(native: PlaybackState) {
  noteNativeState(native);
  const { queue } = getPlayerState();
  const key = native.interstitial
    ? queue.entries[native.index ?? -1]?.key
    : native.trackId;
  const known = queue.entries.some((entry) => entry.key === key);
  setPlayerState({
    interstitial: native.interstitial,
    queue:
      known && key !== undefined && key !== queue.currentKey
        ? { ...queue, currentKey: key }
        : queue,
    status: native.status,
  });
  persist();
}

/**
 * The library changed (any `writeLibrary`): deleted songs leave the queue,
 * and new titles or covers go to native for the lock screen.
 */
function onSongsRefreshed(songs: PlayerSongs) {
  const { queue } = getPlayerState();
  const missing = queue.entries
    .map((entry) => entry.songId)
    .filter((songId) => !songs.has(songId));
  if (missing.length > 0) forgetSongs(missing);
  const changed = getPlayerState().queue.entries.some((entry) => {
    const song = songs.get(entry.songId);
    const before = pushedTrack(entry.key);
    return (
      song !== undefined &&
      before !== undefined &&
      !sameTrack(before, trackFor(entry, song))
    );
  });
  if (changed) resyncNative();
}

function onRefetched(songs: unknown) {
  if (songs instanceof Map) onSongsRefreshed(songs);
}

function watchLibrary() {
  const playerSongs = hashKey(PLAYER_SONGS_QUERY);
  queryClient.getQueryCache().subscribe((event) => {
    if (isSettingSongs() || event.type !== "updated") return;
    if (event.action.type !== "success") return;
    if (event.query.queryHash === playerSongs) {
      onRefetched(event.query.state.data);
    }
  });
}

/**
 * Restores the last session (paused where it was), configures the ad, and
 * starts listening to native and the app's life cycle. Runs once, on the
 * player's first use (the mini player mounting, or a play action), which
 * is always after the library is open.
 */
function startPlayer() {
  Audio.addListener("state", onNativeState);
  Audio.addListener("error", reportPlaybackError);
  restoreSession();
  configureAd();
  subscribePremiumTier(configureAd);
  watchLibrary();
  AppState.addEventListener("change", (next) => {
    if (next !== "active") saveFromNative();
  });
  setInterval(() => {
    if (getPlayerState().status === "playing") saveFromNative();
  }, SAVE_EVERY_MS);
}

onFirstUse(startPlayer);
