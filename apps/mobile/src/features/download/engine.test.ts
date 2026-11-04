import assert from "node:assert/strict";
import { test } from "node:test";

import type { ServerAccess } from "./client.ts";
import type { RemoteJob, RemoteTrack } from "./contract.ts";
import type { Download, DownloadDeps, StagedSong } from "./engine.ts";
import { ServerError } from "./client.ts";
import { createDownloads } from "./engine.ts";

const SERVER = { token: "t", url: "https://server" } satisfies ServerAccess;

function track(id: string, state: RemoteTrack["state"]) {
  return {
    fileName: `${id}.m4a`,
    id,
    mimeType: "audio/mp4",
    state,
    title: id,
  } satisfies RemoteTrack;
}

function job(
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
function deferred<Value>() {
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
function setup(overrides: Partial<DownloadDeps> = {}) {
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
    startJob: () => Promise.reject(new Error("not scripted")),
    wait: () => Promise.resolve(),
    ...overrides,
  } satisfies DownloadDeps;
  return { added, cancelled, deps, discarded, saved };
}

async function settled(predicate: () => boolean) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (predicate()) return;
    await new Promise((done) => setTimeout(done, 1));
  }
  throw new Error("timed out");
}

/** Replies for a job whose tracks finish one at a time, as a real one would. */
function scripted(ids: readonly string[]) {
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

void test("shows a download the moment it starts, before the server answers", () => {
  const { deps } = setup({ startJob: () => new Promise(() => undefined) });
  const downloads = createDownloads(deps);
  downloads.start("s", "https://link");
  assert.equal(downloads.getDownloads()[0]?.state, "starting");
});

void test("imports every song in the link's order, then clears itself", async () => {
  const { added, deps } = setup(scripted(["a", "b", "c"]));
  const downloads = createDownloads(deps);
  downloads.start("s", "https://link");
  await settled(() => downloads.getDownloads().length === 0);
  assert.deepEqual(added, ["a", "b", "c"]);
});

void test("takes songs in order even when a later one is ready first", async () => {
  let replies = 0;
  const { added, deps } = setup({
    acknowledgeTrack: () =>
      Promise.resolve(
        job("done", [track("a", "delivered"), track("b", "delivered")]),
      ),
    fetchJob: () => {
      replies += 1;
      return Promise.resolve(
        replies === 1
          ? job("running", [track("a", "working"), track("b", "ready")])
          : job("running", [track("a", "delivered"), track("b", "ready")]),
      );
    },
    startJob: () =>
      Promise.resolve(
        job("running", [track("a", "working"), track("b", "ready")]),
      ),
  });
  const downloads = createDownloads(deps);
  downloads.start("s", "https://link");
  await settled(() => added.length > 0);
  assert.deepEqual(added, ["b"]);
  assert.ok(replies >= 2, "it waited for the first song before the second");
});

void test("a song the server couldn't get is reported, and the rest still come", async () => {
  const { added, deps } = setup({
    acknowledgeTrack: () =>
      Promise.resolve(
        job("done", [track("a", "failed"), track("b", "delivered")]),
      ),
    startJob: () =>
      Promise.resolve(
        job("running", [track("a", "failed"), track("b", "ready")]),
      ),
  });
  const downloads = createDownloads(deps);
  downloads.start("s", "https://link");
  await settled(() => downloads.getDownloads()[0]?.state === "finished");
  assert.deepEqual(added, ["b"]);
  assert.equal(
    downloads.getDownloads()[0]?.message,
    "1 song couldn't be downloaded.",
  );
});

void test("a link the server refuses shows its message", async () => {
  const { deps } = setup({
    startJob: () =>
      Promise.reject(new ServerError(422, "unsupported_link", "No can do.")),
  });
  const downloads = createDownloads(deps);
  downloads.start("s", "https://link");
  await settled(() => downloads.getDownloads()[0]?.state === "failed");
  assert.equal(downloads.getDownloads()[0]?.message, "No can do.");
});

void test("a job that fails on the server shows why", async () => {
  const { deps } = setup({
    startJob: () => Promise.resolve(job("failed", [], "That's 40 songs.")),
  });
  const downloads = createDownloads(deps);
  downloads.start("s", "https://link");
  await settled(() => downloads.getDownloads()[0]?.state === "failed");
  assert.equal(downloads.getDownloads()[0]?.message, "That's 40 songs.");
});

void test("a download the server forgot says to try again", async () => {
  const saved = {
    done: 2,
    failed: 0,
    jobId: "old",
    key: "d",
    message: null,
    serverId: "s",
    state: "running",
    title: "Album",
    total: 5,
    url: "https://link",
  } satisfies Download;
  const { deps } = setup({
    fetchJob: () => Promise.reject(new ServerError(404, "not_found", "Gone.")),
    load: () => [saved],
  });
  const downloads = createDownloads(deps);
  downloads.resume();
  await settled(() => downloads.getDownloads()[0]?.state === "failed");
  assert.match(
    downloads.getDownloads()[0]?.message ?? "",
    /Try the link again/,
  );
});

void test("an unreachable server stops trying, and carries on when asked", async () => {
  let up = false;
  const script = scripted(["a"]);
  let attempts = 0;
  const { added, deps } = setup({
    ...script,
    startJob: () => {
      attempts += 1;
      return up ? script.startJob() : Promise.reject(new TypeError("Network"));
    },
  });
  const downloads = createDownloads(deps);
  downloads.start("s", "https://link");
  await settled(() => attempts === 5);
  await settled(() => downloads.getDownloads()[0]?.state === "offline");
  await new Promise((done) => setTimeout(done, 5));
  assert.equal(attempts, 5);
  up = true;
  downloads.resume();
  await settled(() => downloads.getDownloads().length === 0);
  assert.deepEqual(added, ["a"]);
});

void test("stops in the background and carries on in front", async () => {
  let foreground = false;
  const { added, deps } = setup({
    ...scripted(["a"]),
    isForeground: () => foreground,
  });
  const downloads = createDownloads(deps);
  downloads.start("s", "https://link");
  await new Promise((done) => setTimeout(done, 5));
  assert.deepEqual(added, []);
  foreground = true;
  downloads.resume();
  await settled(() => downloads.getDownloads().length === 0);
  assert.deepEqual(added, ["a"]);
});

void test("cancelling tells the server, and a song on its way is thrown out", async () => {
  const file = deferred<StagedSong>();
  const { added, cancelled, deps, discarded } = setup({
    ...scripted(["a"]),
    fetchFile: () => file.promise,
  });
  const downloads = createDownloads(deps);
  const key = downloads.start("s", "https://link");
  await settled(() => downloads.getDownloads()[0]?.jobId === "job");
  await new Promise((done) => setTimeout(done, 2));
  downloads.cancel(key);
  assert.equal(downloads.getDownloads().length, 0);
  assert.deepEqual(cancelled, ["job"]);
  file.resolve({ key: "a", mimeType: null, name: "a.m4a", uri: "file:///a" });
  await settled(() => discarded.length === 1);
  assert.deepEqual(added, []);
});

void test("cancelling before the server answers still stops the server's job", async () => {
  const reply = deferred<RemoteJob>();
  const { cancelled, deps } = setup({ startJob: () => reply.promise });
  const downloads = createDownloads(deps);
  const key = downloads.start("s", "https://link");
  downloads.cancel(key);
  reply.resolve(job("resolving", []));
  await settled(() => cancelled.length === 1);
  assert.deepEqual(cancelled, ["job"]);
});

void test("a removed server fails the download instead of hanging", async () => {
  const { deps } = setup({ server: () => null });
  const downloads = createDownloads(deps);
  downloads.start("s", "https://link");
  await settled(() => downloads.getDownloads()[0]?.state === "failed");
  assert.equal(
    downloads.getDownloads()[0]?.message,
    "That server was removed.",
  );
});

void test("saves what it's doing, so a relaunch can carry on", async () => {
  const { deps, saved } = setup({
    ...scripted(["a"]),
    startJob: () => new Promise(() => undefined),
  });
  const downloads = createDownloads(deps);
  downloads.start("s", "https://link");
  await settled(() => saved.value.length === 1);
  assert.equal(saved.value[0]?.url, "https://link");
});
