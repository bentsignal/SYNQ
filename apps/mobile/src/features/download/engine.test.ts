import assert from "node:assert/strict";
import { test } from "node:test";

import type { RemoteJob } from "./contract.ts";
import type { Download, StagedSong } from "./engine.ts";
import { ServerError } from "./client.ts";
import {
  deferred,
  job,
  scripted,
  settled,
  setup,
  track,
} from "./engine-test-kit.ts";
import { createDownloads } from "./engine.ts";

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
