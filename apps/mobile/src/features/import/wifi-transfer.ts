import { useSyncExternalStore } from "react";
import { AppState } from "react-native";
import { Directory } from "expo-file-system";

import type { TransferServerState } from "./transfer-link";
import { synqMedia, synqMediaAvailable } from "~/features/media/native";
import { getPlayerState, isPlaying } from "~/features/player/store";
import {
  getPreference,
  subscribePreferences,
} from "~/features/preferences/store";
import { themeAccent } from "~/features/preferences/themes";
import { readJson, writeJson } from "~/lib/kv";
import { IMPORT_DIRECTORY } from "./pipeline";
import { parseUploadType } from "./progress";
import {
  getImportState,
  setTransfersOn as setImportTransfersOn,
  subscribeImportState,
  uploadFailed,
  uploadReceived,
  uploadsStopped,
  uploadStarted,
} from "./session";
import { liveMessage, PAGE_GONE_MS, wantsServer } from "./transfer-link";
import { TRANSFER_EXTENSIONS, transferPage } from "./transfer-page";

/**
 * Wi-Fi Transfer's server (docs/ui.md → Import). It outlives the sheet: the
 * switch allows uploads, the person closes the sheet and goes on using the
 * app, and a computer's browser sends files whenever it likes.
 *
 * The server starts the first time someone opens Wi-Fi Transfer, because a
 * listener can bring up iOS's Local Network prompt, and from then on with the
 * app. The switch starts off on every launch, so a library doesn't go on
 * taking files from the network because someone once flipped it.
 */

export interface WifiTransferState {
  readonly on: boolean;
  readonly server: TransferServerState;
  /** A computer's page holds the live link. */
  readonly connected: boolean;
}

/** 2.5.2's port, which people may have bookmarked. */
const PREFERRED_PORT = 3000;
const USED_KEY = "synq.wifi-transfer-used";
/** Lets the launch finish first. */
const RESTORE_DELAY_MS = 1500;

function wifiState(value: WifiTransferState) {
  return value;
}

let state = wifiState({
  connected: false,
  on: false,
  server: { state: "idle" },
});
const listeners = new Set<() => void>();

let usedBefore = readJson(USED_KEY, (stored) => stored === true);
let usedThisLaunch = false;
let attached = false;
let installed = false;
let lastPort = PREFERRED_PORT;
/** Every start gets a number, so a stale outcome can be ignored. */
let startNumber = 0;
let pageGoneTimer: ReturnType<typeof setTimeout> | undefined;
let lastMessage: string | undefined;
/** Backgrounded with nothing playing: iOS is about to suspend the app. */
let away = false;

function publish(change: Partial<WifiTransferState>) {
  state = { ...state, ...change };
  for (const listener of listeners) listener();
}

function hasLiveLink() {
  return (
    synqMediaAvailable() && typeof synqMedia().setTransferState === "function"
  );
}

function currentAccent() {
  return themeAccent(getPreference("theme"));
}

/** Tells the server, and through it any open page, what changed. */
function pushLiveState() {
  if (!hasLiveLink()) return;
  const { batch, finished, shown } = getImportState();
  const message = liveMessage({
    accent: currentAccent(),
    away,
    importing: !finished && batch.total > 0,
    imported: finished ? batch.imported : shown.done,
    on: state.on,
  });
  if (message === lastMessage) return;
  lastMessage = message;
  synqMedia().setTransferState?.(message, state.on);
}

function pageCount(count: number) {
  if (pageGoneTimer !== undefined) clearTimeout(pageGoneTimer);
  pageGoneTimer = undefined;
  if (count > 0) {
    publish({ connected: true });
  } else {
    pageGoneTimer = setTimeout(() => {
      publish({ connected: false });
    }, PAGE_GONE_MS);
  }
}

/** Native events go straight on to the import queue, once. */
function attachEvents() {
  if (attached) return;
  attached = true;
  const media = synqMedia();
  media.addListener("onTransferStart", ({ id, mimeType, name }) => {
    const remaining =
      mimeType === undefined ? null : parseUploadType(mimeType).remaining;
    uploadStarted(id, name, remaining);
  });
  media.addListener("onTransferFailed", ({ id }) => uploadFailed(id));
  media.addListener("onTransferFile", ({ id, mimeType, name, uri }) => {
    const upload = parseUploadType(mimeType);
    uploadReceived(
      { key: id, mimeType: upload.mimeType, name, uri },
      upload.remaining,
    );
  });
  media.addListener("onTransferStopped", () => {
    uploadsStopped();
    pageCount(0);
    publish({ server: { state: "idle" } });
    // In the background it comes back with the app (`returnedToForeground`).
    if (AppState.currentState === "active") startServer();
  });
  if (hasLiveLink()) {
    media.addListener("onTransferClients", ({ count }) => pageCount(count));
    subscribeImportState(pushLiveState);
    subscribePreferences(pushLiveState);
  }
}

function startServer() {
  if (!synqMediaAvailable()) {
    publish({ server: { state: "failed" } });
    return;
  }
  const media = synqMedia();
  const address = media.wifiAddress();
  if (address === null) {
    publish({ server: { state: "offline" } });
    return;
  }
  attachEvents();
  pushLiveState();
  startNumber += 1;
  const number = startNumber;
  publish({ server: { state: "starting" } });
  media
    .startTransferServer(
      lastPort,
      transferPage({ accent: currentAccent() }),
      new Directory(IMPORT_DIRECTORY, "wifi").uri,
      TRANSFER_EXTENSIONS,
    )
    .then(
      (port) => {
        if (number !== startNumber) return;
        lastPort = port;
        rememberUsed();
        publish({ server: { address, port, state: "ready" } });
      },
      () => {
        if (number === startNumber) publish({ server: { state: "failed" } });
      },
    );
}

/**
 * Stored once a listener has started, by which time iOS has asked for its
 * permission, if it was going to. Later launches start without a new prompt.
 */
function rememberUsed() {
  if (usedBefore) return;
  usedBefore = true;
  writeJson(USED_KEY, true);
}

function isUsed() {
  return usedBefore || usedThisLaunch;
}

function stopServer() {
  startNumber += 1;
  if (synqMediaAvailable()) synqMedia().stopTransferServer();
  uploadsStopped();
  pageCount(0);
  publish({ server: { state: "idle" } });
}

function shouldRun() {
  return wantsServer({
    hasLiveLink: hasLiveLink(),
    on: state.on,
    used: isUsed(),
  });
}

/** Starts the server if it should be running and isn't. */
function reconcileServer() {
  const wanted = shouldRun();
  const { server } = state;
  if (wanted && server.state !== "ready" && server.state !== "starting") {
    startServer();
  } else if (!wanted && server.state !== "idle") {
    stopServer();
  }
}

/**
 * Back from the background. iOS may have reclaimed the listener while the
 * app was suspended, and the network may be a different one.
 */
function returnedToForeground() {
  if (!synqMediaAvailable()) return;
  if (!shouldRun()) return;
  const media = synqMedia();
  const { server } = state;
  if (server.state !== "ready") {
    reconcileServer();
    return;
  }
  const address = media.wifiAddress();
  if (address === null) {
    publish({ server: { state: "offline" } });
    return;
  }
  if (address !== server.address) publish({ server: { ...server, address } });
  void media.checkTransferServer?.().then((alive) => {
    if (!alive && state.server.state === "ready") startServer();
  });
}

/** Once, at launch: follows the app's foreground from here on. */
export function installWifiTransfer() {
  if (installed || !synqMediaAvailable()) return;
  installed = true;
  AppState.addEventListener("change", (next) => {
    if (next === "active" || next === "background") {
      // Playing music keeps the app, and so the server, running.
      away = next === "background" && !isPlaying(getPlayerState().status);
      pushLiveState();
    }
    if (next === "active") returnedToForeground();
  });
  if (!usedBefore || !hasLiveLink()) return;
  // Someone who already answered the permission prompt isn't asked again.
  setTimeout(reconcileServer, RESTORE_DELAY_MS);
}

/** The sheet opened: from now on the server runs with the app. */
export function openWifiTransfer() {
  usedThisLaunch = true;
  if (state.server.state === "ready") {
    returnedToForeground();
    return;
  }
  reconcileServer();
}

/** Try Again, after no Wi-Fi or a failed start. */
export function retryWifiTransfer() {
  startServer();
}

export function setTransfersOn(on: boolean) {
  setImportTransfersOn(on);
  publish({ on });
  pushLiveState();
  reconcileServer();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useWifiTransfer<Selected>(
  select: (current: WifiTransferState) => Selected,
) {
  return useSyncExternalStore(subscribe, () => select(state));
}

/** The binary can copy to the pasteboard. */
export function copyAddress(address: string) {
  synqMedia().copyText?.(`http://${address}`);
}

export function canCopyAddress() {
  return synqMediaAvailable() && synqMedia().copyText !== undefined;
}

export function canShowConnected() {
  return hasLiveLink();
}
