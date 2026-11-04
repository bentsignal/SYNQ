import type { ServerAccess } from "./client.ts";
import type { RemoteJob, RemoteTrack } from "./contract.ts";
import { ServerError } from "./client.ts";

/**
 * Moves downloads from a server into the import queue (docs/ui.md → Import).
 * Nothing here depends on a screen being open. A download runs while the app
 * is in front; the server keeps working when it isn't, up to a point, and the
 * app picks up where it left off when it comes back.
 */

export type DownloadState =
  /** Waiting for the server to read the link. */
  | "starting"
  | "running"
  /** The server can't be reached; it tries again when the app returns. */
  | "offline"
  /** Nothing more will happen, and `message` says why. */
  | "failed"
  /** Done, with some songs missing, which `message` says. */
  | "finished";

export interface Download {
  readonly key: string;
  readonly serverId: string;
  readonly url: string;
  /** The server's ID for it, once it has one. */
  readonly jobId: string | null;
  readonly title: string | null;
  readonly state: DownloadState;
  /** Songs that have reached the phone. */
  readonly done: number;
  readonly failed: number;
  readonly total: number;
  readonly message: string | null;
}

/** A song's file, ready for the import queue. */
export interface StagedSong {
  key: string;
  name: string;
  uri: string;
  mimeType: string | null;
}

/** What the engine needs from the app, which tests replace. */
export interface DownloadDeps {
  /** How to reach the server, or null if it was removed. */
  server: (serverId: string) => ServerAccess | null;
  startJob: (server: ServerAccess, url: string) => Promise<RemoteJob>;
  fetchJob: (server: ServerAccess, jobId: string) => Promise<RemoteJob>;
  cancelJob: (server: ServerAccess, jobId: string) => Promise<unknown>;
  acknowledgeTrack: (
    server: ServerAccess,
    jobId: string,
    trackId: string,
  ) => Promise<RemoteJob>;
  fetchFile: (
    server: ServerAccess,
    download: Download,
    jobId: string,
    track: RemoteTrack,
  ) => Promise<StagedSong>;
  /** Hands a song to the import queue, which owns it from then on. */
  addSong: (song: StagedSong) => void;
  discardSong: (song: StagedSong) => void;
  /** How many more songs are coming, so the import can count them in. */
  setIncoming: (count: number) => void;
  isForeground: () => boolean;
  wait: (ms: number) => Promise<unknown>;
  load: () => readonly Download[];
  save: (downloads: readonly Download[]) => void;
  newKey: () => string;
}

const POLL_MS = 2000;
/** Tries before giving up until the app next comes to the front. */
const MAX_MISSES = 5;
const GONE =
  "This server doesn't have that download anymore. Try the link again.";
const SERVER_REMOVED = "That server was removed.";
const OFFLINE = "Can't reach the server.";

function isSettled({ state }: Download) {
  return state === "failed" || state === "finished";
}

function failedLine(failed: number) {
  return failed === 1
    ? "1 song couldn't be downloaded."
    : `${String(failed)} songs couldn't be downloaded.`;
}

/** Identifies a track across retries of a job. */
function handoverKey(job: RemoteJob, track: RemoteTrack) {
  return `${job.id}/${track.id}`;
}

function jobCounts(job: RemoteJob, handedOver: ReadonlySet<string>) {
  return {
    done: job.tracks.filter(
      (track) =>
        track.state === "delivered" || handedOver.has(handoverKey(job, track)),
    ).length,
    failed: job.tracks.filter(({ state }) => state === "failed").length,
    total: job.tracks.length,
  };
}

/** The list of downloads, saved and announced on every change. */
function createStore(deps: DownloadDeps) {
  let downloads = deps.load();
  const listeners = new Set<() => void>();

  function publish(next: readonly Download[]) {
    downloads = next;
    deps.save(downloads);
    for (const listener of listeners) listener();
  }

  return {
    add: (download: Download) => publish([...downloads, download]),
    all: () => downloads,
    find: (key: string) => downloads.find((download) => download.key === key),
    remove: (key: string) =>
      publish(downloads.filter((download) => download.key !== key)),
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    update: (key: string, change: Partial<Download>) =>
      publish(
        downloads.map((download) =>
          download.key === key ? { ...download, ...change } : download,
        ),
      ),
  };
}

type Store = ReturnType<typeof createStore>;

interface Engine {
  deps: DownloadDeps;
  store: Store;
  /** Songs the import queue has, so a retry doesn't import them twice. */
  handedOver: Set<string>;
}

/** Hands a song to the import queue, unless it's there already. */
async function handOver(
  { deps, handedOver, store }: Engine,
  key: string,
  server: ServerAccess,
  { job, track }: { job: RemoteJob; track: RemoteTrack },
) {
  if (handedOver.has(handoverKey(job, track))) return;
  const download = store.find(key);
  if (download === undefined) return;
  const song = await deps.fetchFile(server, download, job.id, track);
  // Cancelled while it was on its way.
  if (store.find(key) === undefined) {
    deps.discardSong(song);
    return;
  }
  deps.addSong(song);
  handedOver.add(handoverKey(job, track));
  // In the same moment as the song joining the queue, so the import's total
  // stays right.
  store.update(key, jobCounts(job, handedOver));
}

/**
 * Brings the next songs over, in the order they come in the link, so an
 * album imports in order however the server's work finished. Returns the
 * job as it stands, and whether any song came.
 */
async function deliver(
  engine: Engine,
  key: string,
  server: ServerAccess,
  first: RemoteJob,
) {
  const { deps, handedOver, store } = engine;
  let job = first;
  let moved = false;
  for (;;) {
    const next = job.tracks.find(
      ({ state }) => state !== "delivered" && state !== "failed",
    );
    if (next?.state !== "ready" || store.find(key) === undefined) {
      return { job, moved };
    }
    await handOver(engine, key, server, { job, track: next });
    if (store.find(key) === undefined) return { job, moved };
    job = await deps.acknowledgeTrack(server, job.id, next.id);
    handedOver.delete(handoverKey(job, next));
    moved = true;
    if (store.find(key) === undefined) return { job, moved };
    store.update(key, { ...jobCounts(job, handedOver), title: job.title });
  }
}

/** Closes a download the server is finished with. True if it was. */
function settle({ handedOver, store }: Engine, key: string, job: RemoteJob) {
  if (job.state === "failed") {
    store.update(key, {
      message: job.error ?? "This link couldn't be read.",
      state: "failed",
    });
    return true;
  }
  if (job.state !== "done") return false;
  const { failed } = jobCounts(job, handedOver);
  if (failed === 0) store.remove(key);
  else store.update(key, { message: failedLine(failed), state: "finished" });
  return true;
}

/** One round with the server: where the job stands, and any songs ready. */
async function step(engine: Engine, download: Download, server: ServerAccess) {
  const { deps, handedOver, store } = engine;
  const { key, jobId, url } = download;
  const job =
    jobId === null
      ? await deps.startJob(server, url)
      : await deps.fetchJob(server, jobId);
  // Cancelled while the server was starting it: it mustn't run on.
  if (store.find(key) === undefined) {
    if (jobId === null) deps.cancelJob(server, job.id).catch(() => undefined);
    return { done: true, moved: false };
  }
  store.update(key, {
    ...jobCounts(job, handedOver),
    jobId: job.id,
    message: null,
    state: job.state === "resolving" ? "starting" : "running",
    title: job.title,
  });
  const delivered = await deliver(engine, key, server, job);
  if (store.find(key) === undefined) return { done: true, moved: false };
  return { done: settle(engine, key, delivered.job), moved: delivered.moved };
}

/** A round that failed. Returns whether it's worth trying again. */
function failedRound(
  store: Store,
  key: string,
  error: unknown,
  misses: number,
) {
  if (store.find(key) === undefined) return false;
  if (error instanceof ServerError) {
    store.update(key, {
      message: error.status === 404 ? GONE : error.message,
      state: "failed",
    });
    return false;
  }
  store.update(key, { message: OFFLINE, state: "offline" });
  return misses < MAX_MISSES;
}

async function drive(engine: Engine, key: string) {
  const { deps, store } = engine;
  let misses = 0;
  for (;;) {
    const download = store.find(key);
    if (download === undefined || isSettled(download)) return;
    if (!deps.isForeground()) return;
    const server = deps.server(download.serverId);
    if (server === null) {
      store.update(key, { message: SERVER_REMOVED, state: "failed" });
      return;
    }
    try {
      const { done, moved } = await step(engine, download, server);
      if (done) return;
      misses = 0;
      if (!moved) await deps.wait(POLL_MS);
    } catch (error) {
      misses += 1;
      if (!failedRound(store, key, error, misses)) return;
      await deps.wait(POLL_MS * misses);
    }
  }
}

export function createDownloads(deps: DownloadDeps) {
  const store = createStore(deps);
  const engine = { deps, handedOver: new Set<string>(), store };
  const driving = new Set<string>();

  /** Only what's moving counts: a paused download mustn't hold an import open. */
  function announceIncoming() {
    let incoming = 0;
    for (const { done, failed, key, total } of store.all()) {
      if (driving.has(key)) incoming += Math.max(0, total - done - failed);
    }
    deps.setIncoming(incoming);
  }

  store.subscribe(announceIncoming);

  function kick(key: string) {
    if (driving.has(key)) return;
    driving.add(key);
    announceIncoming();
    drive(engine, key)
      .catch(() => undefined)
      .finally(() => {
        driving.delete(key);
        announceIncoming();
      });
  }

  return {
    getDownloads: () => store.all(),
    subscribe: (listener: () => void) => store.subscribe(listener),
    /** Shows the download right away, and starts it. */
    start(serverId: string, url: string) {
      const key = deps.newKey();
      store.add({
        done: 0,
        failed: 0,
        jobId: null,
        key,
        message: null,
        serverId,
        state: "starting",
        title: null,
        total: 0,
        url,
      });
      kick(key);
      return key;
    },
    /** Takes it off the list, and tells the server to stop if it's working. */
    cancel(key: string) {
      const download = store.find(key);
      if (download === undefined) return;
      store.remove(key);
      if (download.jobId === null) return;
      const server = deps.server(download.serverId);
      if (server === null) return;
      deps.cancelJob(server, download.jobId).catch(() => undefined);
    },
    /** Carries on with everything unfinished: at launch, or back in front. */
    resume() {
      for (const download of store.all()) {
        if (!isSettled(download)) kick(download.key);
      }
    },
  };
}
