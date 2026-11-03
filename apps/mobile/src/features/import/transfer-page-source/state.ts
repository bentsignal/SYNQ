export const LOST_MS = 2500;
export const RETRY_MS = 1200;
export const CHECK_MS = 1500;
export const RECONNECT_MS = 500;
export const DRAW_MS = 300;
export const MAX_TRIES = 5;
export const FINISH_FALLBACK_MS = 5000;

export interface Upload {
  file: File;
  id: string;
  /** It may have arrived already, so ask before sending it again. */
  suspect: boolean;
  tries: number;
}

/** What the phone last said. */
class LiveState {
  on = true;
  importing = false;
  imported = 0;
}

/** What the page knows: the link to the phone, and the files on their way. */
class PageState {
  live = new LiveState();
  link: "basic" | "connecting" | "live" | "lost" = "connecting";
  source: EventSource | null = null;
  lastHeard = Date.now();
  streamSeen = false;
  checking = false;
  away = false;

  queue = new Array<Upload>();
  current: { item: Upload; file: File; xhr: XMLHttpRequest } | null = null;
  waiting = false;
  attempt = 0;
  sent = 0;
  total = 0;
  totalBytes = 0;
  sentBytes = 0;
  loaded = 0;
  adding = false;
  sawImport = false;
  finishTimer: number | null = null;
  problemNames = new Array<string>();
  nextId = 0;
  lastDraw = 0;
  drawTimer: number | null = null;
  pageId = Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const state = new PageState();

export function paused() {
  return !state.live.on || state.link === "lost" || state.link === "connecting";
}
