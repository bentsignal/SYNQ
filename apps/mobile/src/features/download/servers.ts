import { useSyncExternalStore } from "react";
import * as SecureStore from "expo-secure-store";

import { readJson, writeJson } from "~/lib/kv";
import { field } from "./contract";

/**
 * The download servers someone has added. An address can carry a private
 * server's token, so addresses go in the Keychain: `preferences.db` sits under
 * `Documents/`, which the Files app shows. Preferences keep only the names.
 */

export interface DownloadServer {
  readonly id: string;
  readonly name: string;
}

interface ServersState {
  readonly servers: readonly DownloadServer[];
  readonly defaultId: string | null;
}

const STORAGE_KEY = "synq.downloadServerNames";

/** Types a state (its values are built from literals). */
function serversState(value: ServersState) {
  return value;
}

const EMPTY = serversState({ defaultId: null, servers: [] });

function isServer(value: unknown): value is DownloadServer {
  return (
    typeof field(value, "id") === "string" &&
    typeof field(value, "name") === "string"
  );
}

function stateFrom(stored: unknown) {
  if (typeof stored !== "object" || stored === null) return EMPTY;
  const servers = field(stored, "servers");
  const defaultId = field(stored, "defaultId");
  return serversState({
    defaultId: typeof defaultId === "string" ? defaultId : null,
    servers: Array.isArray(servers) ? servers.filter(isServer) : [],
  });
}

let state = readJson(STORAGE_KEY, stateFrom);
const listeners = new Set<() => void>();

function publish(next: ServersState) {
  state = next;
  writeJson(STORAGE_KEY, state);
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function addressKey(id: string) {
  return `download-server.${id}`;
}

/** Part of the servers' state, re-rendering when it changes. */
export function useServers<Selected>(
  select: (current: ServersState) => Selected,
) {
  return useSyncExternalStore(subscribe, () => select(state));
}

export function newServerId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Adds a server. The first one added becomes the default. */
export function addServer(server: DownloadServer, address: string) {
  SecureStore.setItem(addressKey(server.id), address, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });
  publish({
    defaultId: state.defaultId ?? server.id,
    servers: [...state.servers, server],
  });
}

/** Removes a server and its address. The next one left becomes the default. */
export function removeServer(id: string) {
  const servers = state.servers.filter((server) => server.id !== id);
  publish({
    defaultId:
      state.defaultId === id ? (servers[0]?.id ?? null) : state.defaultId,
    servers,
  });
  SecureStore.deleteItemAsync(addressKey(id)).catch(() => undefined);
}

export function setDefaultServer(id: string) {
  publish({ ...state, defaultId: id });
}

export function storedServerAddress(id: string) {
  return SecureStore.getItem(addressKey(id));
}

/** How to reach a server, or null if it's gone. */
export function serverAccess(id: string) {
  const known = state.servers.some((server) => server.id === id);
  const url = storedServerAddress(id);
  return !known || url === null ? null : { url };
}
