import type { PlaybackState } from "@synq/audio";
import * as Audio from "@synq/audio";
import { findLikedPlaylistId } from "@synq/db";
import { getLegacyImport } from "@synq/db/legacy";

import { libraryDb } from "~/features/library/database";
import { takeLegacySettings } from "~/features/library/legacy-settings";
import { readJson, writeJson } from "~/lib/kv";
import { native, tracksFor } from "./native-queue";
import { currentIndex } from "./queue-model";
import {
  decodeSession,
  encodeSession,
  queueFromSession,
  restoredPosition,
  sessionFromLegacy,
} from "./session";
import { loadSongs, setSongs } from "./songs";
import { getPlayerState, setPlayerState } from "./store";

/**
 * The session in the kv store: written on every native `state` event
 * (pause, track change), when the app leaves the foreground, and
 * every so often while playing; restored, paused, at launch.
 */
const SESSION_KEY = "synq.player.session";

let restoredPositionMs = 0;
/** The last state native reported, for the position. */
let lastNative: PlaybackState | undefined;

export function noteNativeState(state: PlaybackState) {
  lastNative = state;
}

/** The current entry's position, as native last reported it. */
function positionMs() {
  const { current } = getPlayerState();
  if (lastNative === undefined) return restoredPositionMs;
  if (current === null) return 0;
  return lastNative.trackId === current.key ? lastNative.positionMs : 0;
}

export function persist() {
  const state = getPlayerState();
  writeJson(
    SESSION_KEY,
    encodeSession(state.queue, {
      positionMs: Math.round(positionMs()),
      repeat: state.repeat,
      shuffle: state.shuffle,
      source: state.source,
    }),
  );
}

/** Asks native for the exact position, then saves. */
export function saveFromNative() {
  void Audio.getState()
    .then((state) => {
      lastNative = state;
      persist();
    })
    .catch(() => undefined);
}

/** 2.5.2's shuffle and repeat, from the import's own record. */
function legacyPreferences() {
  const imported = getLegacyImport(libraryDb());
  if (imported?.source !== "install") return null;
  const { settings } = imported;
  if (typeof settings !== "object" || settings === null) return null;
  const preferences = asUnknown(Reflect.get(settings, "preferences"));
  if (typeof preferences !== "object" || preferences === null) return null;
  return {
    repeat: Reflect.get(preferences, "repeat") === "all" ? "all" : "off",
    shuffle: Reflect.get(preferences, "shuffle") === true,
  } as const;
}

function asUnknown(value: unknown) {
  return value;
}

/**
 * The first launch of the 3.0 player takes over 2.5.2's queue, position,
 * source, Play Next count, shuffle and repeat (when this install was
 * 2.5.2). `restore` writes the session right away, so they're
 * taken once.
 */
function takeOverLegacySession() {
  return sessionFromLegacy({
    likedPlaylistId: findLikedPlaylistId(libraryDb()),
    preferences: legacyPreferences(),
    session: takeLegacySettings("session"),
  });
}

/** Loads the last session into native, paused where it was. */
export function restoreSession() {
  const stored =
    readJson(SESSION_KEY, decodeSession) ?? takeOverLegacySession();
  const songs = loadSongs(stored.songIds);
  const queue = queueFromSession(stored, (songId) => songs.has(songId));
  restoredPositionMs = restoredPosition(stored, queue);
  setSongs(songs);
  setPlayerState({
    queue,
    repeat: stored.repeat,
    shuffle: stored.shuffle,
    source: stored.source,
  });
  persist();
  if (queue.entries.length > 0) {
    native(
      Audio.setQueue(tracksFor(queue.entries, songs), {
        play: false,
        positionMs: restoredPositionMs,
        startIndex: currentIndex(queue),
      }),
    );
  }
  native(Audio.setRepeatMode(stored.repeat));
}
