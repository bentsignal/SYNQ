import { useSyncExternalStore } from "react";
import { AppState } from "react-native";
import { Directory, File, Paths } from "expo-file-system";

import type { Download, DownloadState } from "./engine";
import { discardSource } from "~/features/import/pipeline";
import {
  addImportSources,
  setIncomingImports,
} from "~/features/import/session";
import { readJson, writeJson } from "~/lib/kv";
import {
  acknowledgeTrack,
  cancelJob,
  fetchJob,
  startJob,
  trackFileUrl,
} from "./client";
import { field, storedFileName } from "./contract";
import { createDownloads } from "./engine";
import { serverAccess } from "./servers";

const STORAGE_KEY = "synq.downloads";
/**
 * Songs on their way to the import queue. Not the import's own staging folder,
 * which it clears between batches, and a batch can end between two songs.
 */
const STAGING = new Directory(Paths.cache, "download");

const STATES = new Set<unknown>([
  "starting",
  "running",
  "offline",
  "failed",
  "finished",
] satisfies DownloadState[]);

function isDownload(value: unknown): value is Download {
  return (
    typeof field(value, "key") === "string" &&
    typeof field(value, "serverId") === "string" &&
    typeof field(value, "url") === "string" &&
    STATES.has(field(value, "state"))
  );
}

function downloadsFrom(stored: unknown) {
  return Array.isArray(stored) ? stored.filter(isDownload) : [];
}

export const downloads = createDownloads({
  acknowledgeTrack,
  addSong: (song) => addImportSources([song]),
  cancelJob,
  discardSong: discardSource,
  fetchFile: async (server, download, jobId, track) => {
    STAGING.create({ idempotent: true, intermediates: true });
    const name = storedFileName(track);
    const key = `download-${download.key}-${track.id}`;
    const destination = new File(
      STAGING,
      `${key}.${name.split(".").at(-1) ?? "m4a"}`,
    );
    const file = await File.downloadFileAsync(
      trackFileUrl(server, jobId, track.id),
      destination,
      { idempotent: true },
    );
    return { key, mimeType: track.mimeType, name, uri: file.uri };
  },
  fetchJob,
  isForeground: () => AppState.currentState === "active",
  load: () => readJson(STORAGE_KEY, downloadsFrom),
  newKey: () =>
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
  save: (list) => writeJson(STORAGE_KEY, list),
  server: serverAccess,
  setIncoming: setIncomingImports,
  startJob,
  wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
});

/** Carries on with unfinished downloads now, and whenever the app returns. */
export function installDownloads() {
  downloads.resume();
  AppState.addEventListener("change", (state) => {
    if (state === "active") downloads.resume();
  });
}

export function useDownloads() {
  return useSyncExternalStore(downloads.subscribe, downloads.getDownloads);
}
