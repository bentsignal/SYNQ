/**
 * The API a download server speaks, version 1 (docs/download-servers.md).
 * Everything a server sends is checked here, since it's someone's own server
 * and may be any version of anything.
 */

export const API_VERSION = 1;

export interface ServerInfo {
  readonly api: number;
  readonly name: string;
  readonly maxTracks: number;
  readonly tokenName: string;
  /** Songs a day, or null for no limit. */
  readonly dailyLimit: number | null;
  readonly usedToday: number;
}

export type RemoteTrackState =
  | "queued"
  | "working"
  | "ready"
  | "delivered"
  | "failed";

export interface RemoteTrack {
  readonly id: string;
  readonly state: RemoteTrackState;
  readonly title: string | null;
  readonly fileName: string | null;
  readonly mimeType: string | null;
}

export type RemoteJobState = "resolving" | "running" | "done" | "failed";

export interface RemoteJob {
  readonly id: string;
  readonly state: RemoteJobState;
  readonly title: string | null;
  readonly error: string | null;
  readonly tracks: readonly RemoteTrack[];
}

function known(value: unknown) {
  return value;
}

/** A property of something a server or storage sent, unchecked. */
export function field(value: unknown, key: string) {
  return typeof value === "object" && value !== null
    ? known(Reflect.get(value, key))
    : undefined;
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value !== "" ? value : null;
}

function count(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

const TRACK_STATES = new Set<unknown>([
  "queued",
  "working",
  "ready",
  "delivered",
  "failed",
] satisfies RemoteTrackState[]);

function isTrackState(value: unknown): value is RemoteTrackState {
  return TRACK_STATES.has(value);
}

const JOB_STATES = new Set<unknown>([
  "resolving",
  "running",
  "done",
  "failed",
] satisfies RemoteJobState[]);

function isJobState(value: unknown): value is RemoteJobState {
  return JOB_STATES.has(value);
}

/** What `GET /v1/me` says, or null if this isn't a download server. */
export function decodeServerInfo(value: unknown) {
  const api = count(field(value, "api"));
  const name = textOrNull(field(value, "name"));
  const maxTracks = count(field(field(value, "limits"), "maxTracks"));
  const token = field(value, "token");
  const tokenName = textOrNull(field(token, "name"));
  const usedToday = count(field(token, "usedToday"));
  if (
    api === null ||
    name === null ||
    maxTracks === null ||
    tokenName === null ||
    usedToday === null
  ) {
    return null;
  }
  return {
    api,
    dailyLimit: count(field(token, "dailyLimit")),
    maxTracks,
    name,
    tokenName,
    usedToday,
  } satisfies ServerInfo;
}

function decodeTrack(value: unknown) {
  const id = textOrNull(field(value, "id"));
  const state = field(value, "state");
  if (id === null || !isTrackState(state)) return null;
  return {
    fileName: textOrNull(field(value, "fileName")),
    id,
    mimeType: textOrNull(field(value, "mimeType")),
    state,
    title: textOrNull(field(value, "title")),
  } satisfies RemoteTrack;
}

/** A job, or null if the reply isn't one. */
export function decodeJob(value: unknown) {
  const id = textOrNull(field(value, "id"));
  const state = field(value, "state");
  const tracks = field(value, "tracks");
  if (id === null || !isJobState(state) || !Array.isArray(tracks)) return null;
  const decoded = new Array<RemoteTrack>();
  for (const track of tracks) {
    const read = decodeTrack(track);
    if (read === null) return null;
    decoded.push(read);
  }
  return {
    error: textOrNull(field(field(value, "error"), "message")),
    id,
    state,
    title: textOrNull(field(value, "title")),
    tracks: decoded,
  } satisfies RemoteJob;
}

/** An error reply's message and code, or null if it has neither. */
export function decodeError(value: unknown) {
  const error = field(value, "error");
  const message = textOrNull(field(error, "message"));
  const code = textOrNull(field(error, "code"));
  return message === null || code === null ? null : { code, message };
}

/**
 * What someone typed as a server's address, without the trailing slash, or
 * null if it can't be one. HTTPS is assumed when no scheme is given.
 */
export function serverAddress(text: string) {
  const typed = text.trim();
  if (typed === "") return null;
  try {
    const url = new URL(
      /^[a-z]+:\/\//i.test(typed) ? typed : `https://${typed}`,
    );
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username !== "" || url.password !== "") return null;
    if (url.hostname === "") return null;
    return `${url.origin}${url.pathname}`.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

const AUDIO_EXTENSION = /\.(m4a|mp3|aac|flac|wav|mp4)$/i;
const NOT_IN_A_NAME = /[:*?"<>|]/g;
const MAX_NAME_LENGTH = 150;

/**
 * The name a file is stored under. The server chooses it, so it can't be
 * allowed to carry a path or a type the import won't recognize.
 */
export function storedFileName(track: RemoteTrack) {
  const base = (track.fileName ?? "")
    .split(/[/\\]/)
    .at(-1)
    ?.split("")
    .filter((character) => character >= " ")
    .join("")
    .replace(NOT_IN_A_NAME, " ")
    .replace(/^\.+/, "")
    .trim();
  const ending = AUDIO_EXTENSION.exec(base ?? "")?.[0];
  const extension = track.mimeType === "audio/mpeg" ? ".mp3" : ".m4a";
  const stem = (base ?? "")
    .replace(AUDIO_EXTENSION, "")
    .slice(0, MAX_NAME_LENGTH)
    .trim();
  return `${stem === "" ? "Song" : stem}${ending ?? extension}`;
}
