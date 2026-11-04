import { useSyncExternalStore } from "react";
import * as SecureStore from "expo-secure-store";

import { readJson, writeJson } from "~/lib/kv";
import { field } from "./contract";

/**
 * The download servers someone has added. Their addresses are ordinary
 * preferences; tokens go in the Keychain, because `preferences.db` sits under
 * `Documents/`, which the Files app shows.
 */

export interface DownloadServer {
  readonly id: string;
  readonly name: string;
  readonly url: string;
}

interface ServersState {
  readonly servers: readonly DownloadServer[];
  readonly defaultId: string | null;
}

const STORAGE_KEY = "synq.downloadServers";

/** Types a state (its values are built from literals). */
function serversState(value: ServersState) {
  return value;
}

const EMPTY = serversState({ defaultId: null, servers: [] });

function isServer(value: unknown): value is DownloadServer {
  return (
    typeof field(value, "id") === "string" &&
    typeof field(value, "name") === "string" &&
    typeof field(value, "url") === "string"
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

function tokenKey(id: string) {
  return `download-server-token.${id}`;
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
export function addServer(server: DownloadServer, token: string) {
  SecureStore.setItem(tokenKey(server.id), token, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });
  publish({
    defaultId: state.defaultId ?? server.id,
    servers: [...state.servers, server],
  });
}

/** Removes a server and its token. The next one left becomes the default. */
export function removeServer(id: string) {
  const servers = state.servers.filter((server) => server.id !== id);
  publish({
    defaultId:
      state.defaultId === id ? (servers[0]?.id ?? null) : state.defaultId,
    servers,
  });
  SecureStore.deleteItemAsync(tokenKey(id)).catch(() => undefined);
}

export function setDefaultServer(id: string) {
  publish({ ...state, defaultId: id });
}

export function serverToken(id: string) {
  return SecureStore.getItem(tokenKey(id));
}

/** A server's address and token, or null if it's gone. */
export function serverAccess(id: string) {
  const server = state.servers.find((candidate) => candidate.id === id);
  const token = serverToken(id);
  return server === undefined || token === null
    ? null
    : { token, url: server.url };
}
