import type { ServerAccess } from "./client.ts";
import type { RemoteJob, RemoteTrack } from "./contract.ts";
import type { Download, DownloadDeps, StagedSong } from "./engine.ts";

const SERVER = { url: "https://server" } satisfies ServerAccess;

export function track(id: string, state: RemoteTrack["state"]) {
  return {
    fileName: `${id}.m4a`,
    id,
    mimeType: "audio/mp4",
    state,
    title: id,
  } satisfies RemoteTrack;
}

export function job(
  state: RemoteJob["state"],
  tracks: readonly RemoteTrack[],
  error: string | null = null,
) {
  return {
    error,
    id: "job",
    state,
    title: "Album",
    tracks,
  } satisfies RemoteJob;
}

/** A promise settled from outside, for a reply that comes when a test says. */
export function deferred<Value>() {
  const resolvers = new Array<(value: Value) => void>();
  const promise = new Promise<Value>((resolve) => {
    resolvers.push(resolve);
  });
  return {
    promise,
    resolve: (value: Value) => {
      for (const resolve of resolvers) resolve(value);
    },
  };
}

/** A server whose job is scripted, reply by reply, and the app around it. */
export function setup(overrides: Partial<DownloadDeps> = {}) {
  const added = new Array<string>();
  const discarded = new Array<string>();
  const cancelled = new Array<string>();
  const saved = { value: new Array<Download>() };
  let keys = 0;
  const deps = {
    acknowledgeTrack: () => Promise.reject(new Error("not scripted")),
    addSong: (song: StagedSong) => {
      added.push(song.key);
    },
    cancelJob: (_server: ServerAccess, id: string) => {
      cancelled.push(id);
      return Promise.resolve();
    },
    discardSong: (song: StagedSong) => {
      discarded.push(song.key);
    },
    fetchFile: (
      _server: ServerAccess,
      _download: Download,
      _job: string,
      remote: RemoteTrack,
    ) =>
      Promise.resolve({
        key: remote.id,
        mimeType: remote.mimeType,
        name: remote.fileName ?? "",
        uri: `file:///${remote.id}`,
      }),
    fetchJob: () => Promise.reject(new Error("not scripted")),
    isForeground: () => true,
    load: () => [],
    newKey: () => {
      keys += 1;
      return `d${String(keys)}`;
    },
    save: (downloads: readonly Download[]) => {
      saved.value = [...downloads];
    },
    server: () => SERVER,
    setIncoming: () => undefined,
    startJob: () => Promise.reject(new Error("not scripted")),
    wait: () => Promise.resolve(),
    ...overrides,
  } satisfies DownloadDeps;
  return { added, cancelled, deps, discarded, saved };
}

export async function settled(predicate: () => boolean) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (predicate()) return;
    await new Promise((done) => setTimeout(done, 1));
  }
  throw new Error("timed out");
}

/** Replies for a job whose tracks finish one at a time, as a real one would. */
export function scripted(ids: readonly string[]) {
  const delivered = new Set<string>();
  function current() {
    return job(
      delivered.size === ids.length ? "done" : "running",
      ids.map((id) => track(id, delivered.has(id) ? "delivered" : "ready")),
    );
  }
  return {
    acknowledgeTrack: (_s: ServerAccess, _j: string, id: string) => {
      delivered.add(id);
      return Promise.resolve(current());
    },
    fetchJob: () => Promise.resolve(current()),
    startJob: () => Promise.resolve(current()),
  };
}
