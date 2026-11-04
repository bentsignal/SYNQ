import assert from "node:assert/strict";
import { test } from "node:test";

import { job, scripted, settled, setup, track } from "./engine-test-kit.ts";
import { createDownloads } from "./engine.ts";

void test("counts its songs in as incoming until each is handed over", async () => {
  const incoming = new Array<number>();
  const { deps } = setup({
    ...scripted(["a", "b", "c"]),
    setIncoming: (count) => {
      incoming.push(count);
    },
  });
  const downloads = createDownloads(deps);
  downloads.start("s", "https://link");
  await settled(() => downloads.getDownloads().length === 0);
  assert.deepEqual(
    incoming.filter((count, index) => count !== incoming[index - 1]),
    [0, 3, 2, 1, 0],
  );
});

void test("a paused download stops counting as incoming", async () => {
  let foreground = true;
  const incoming = new Array<number>();
  const { deps } = setup({
    acknowledgeTrack: () => {
      foreground = false;
      return Promise.resolve(
        job("running", [track("a", "delivered"), track("b", "working")]),
      );
    },
    isForeground: () => foreground,
    setIncoming: (count) => {
      incoming.push(count);
    },
    startJob: () =>
      Promise.resolve(
        job("running", [track("a", "ready"), track("b", "working")]),
      ),
  });
  const downloads = createDownloads(deps);
  downloads.start("s", "https://link");
  await settled(() => !foreground && incoming.at(-1) === 0);
  assert.equal(downloads.getDownloads().length, 1);
  assert.equal(downloads.getDownloads()[0]?.done, 1);
});

void test("a song isn't imported twice when telling the server fails", async () => {
  const script = scripted(["a"]);
  let failures = 1;
  const { added, deps } = setup({
    ...script,
    acknowledgeTrack: (server, jobId, id) => {
      if (failures > 0) {
        failures -= 1;
        return Promise.reject(new TypeError("Network"));
      }
      return script.acknowledgeTrack(server, jobId, id);
    },
  });
  const downloads = createDownloads(deps);
  downloads.start("s", "https://link");
  await settled(() => downloads.getDownloads().length === 0);
  assert.deepEqual(added, ["a"]);
});
