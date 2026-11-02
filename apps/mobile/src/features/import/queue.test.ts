import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, mock, test } from "node:test";

import type { ImportSource, ReadSong } from "./pipeline.ts";
import {
  ABANDONED_MS,
  CAPSULE_MIN_MS,
  CAPSULE_TICK_MS,
  SETTLED_MS,
} from "./progress.ts";
import {
  addImportSources,
  getImportState,
  installImportQueue,
  onTransferStart,
  setTransfersOn,
  subscribeImportState,
  uploadFailed,
  uploadReceived,
  uploadsStopped,
  uploadStarted,
} from "./queue.ts";

const READ = {
  album: null,
  artists: null,
  covers: null,
  durationMs: 1000,
  mimeType: null,
  title: "Song",
  track: null,
  year: null,
} satisfies ReadSong;

function source(name: string) {
  return {
    key: name,
    mimeType: null,
    name,
    uri: `file:///${name}`,
  } satisfies ImportSource;
}

/** A queue with its app replaced, and a record of what it asked for. */
function setup(failing: readonly string[] = []) {
  const log = {
    added: new Array<string>(),
    finished: new Array<{ imported: number; failed: number }>(),
    nothing: 0,
    refreshes: 0,
    reported: new Array<readonly string[]>(),
    staged: 0,
  };
  installImportQueue({
    add: (item) => {
      if (failing.includes(item.name)) return Promise.reject(new Error("no"));
      log.added.push(item.name);
      return Promise.resolve();
    },
    clearStaging: () => {
      log.staged += 1;
    },
    discard: () => undefined,
    onFinished: ({ failed, imported }) =>
      log.finished.push({ failed, imported }),
    onNothingImported: () => {
      log.nothing += 1;
    },
    read: () => Promise.resolve(READ),
    refreshLibrary: () => {
      log.refreshes += 1;
      return Promise.resolve();
    },
    reportFailures: (names) => log.reported.push(names),
  });
  return log;
}

/** Lets the queue's promises run, then moves the clock. */
async function advance(ms: number) {
  for (let turn = 0; turn < 400; turn += 1) await Promise.resolve();
  mock.timers.tick(ms);
  for (let turn = 0; turn < 400; turn += 1) await Promise.resolve();
}

void describe("a batch", () => {
  beforeEach(() => {
    mock.timers.enable({ apis: ["setTimeout", "setInterval", "Date"] });
  });
  afterEach(() => {
    mock.timers.reset();
  });

  void test("writes each song as it goes but refreshes the library once, at the end", async () => {
    const log = setup();
    addImportSources([source("a"), source("b"), source("c")]);
    await advance(0);
    // All written, so a batch cut short keeps them, yet nothing has refreshed.
    assert.deepEqual(log.added, ["a", "b", "c"]);
    assert.equal(log.refreshes, 0);
    await advance(CAPSULE_MIN_MS);
    assert.equal(log.refreshes, 1);
    assert.deepEqual(log.finished, [{ failed: 0, imported: 3 }]);
    assert.equal(getImportState().finished, true);
  });

  void test("says its result once, then goes away", async () => {
    setup();
    addImportSources([source("a")]);
    await advance(CAPSULE_MIN_MS);
    assert.equal(getImportState().finished, true);
    assert.equal(getImportState().batch.imported, 1);
    await advance(2000);
    assert.equal(getImportState().finished, false);
    assert.equal(getImportState().batch.total, 0);
  });

  void test("a capsule stays up its minimum time however fast files go", async () => {
    const log = setup();
    addImportSources([source("a"), source("b")]);
    await advance(CAPSULE_MIN_MS - 1);
    assert.equal(getImportState().finished, false);
    assert.equal(log.refreshes, 0);
    await advance(1);
    assert.equal(getImportState().finished, true);
  });

  void test("the count changes only on ticks", async () => {
    setup();
    let publishes = 0;
    const counts = new Array<number>();
    subscribeImportState(() => {
      const { done } = getImportState().shown;
      if (counts.at(-1) !== done) {
        counts.push(done);
        publishes += 1;
      }
    });
    addImportSources(
      Array.from({ length: 40 }, (_, index) => source(String(index))),
    );
    await advance(0);
    assert.deepEqual(counts, [0]);
    assert.equal(getImportState().batch.imported, 40);
    await advance(CAPSULE_TICK_MS);
    assert.deepEqual(counts, [0, 10]);
    assert.equal(publishes, 2);
  });

  void test("files picked during a batch join it", async () => {
    const log = setup();
    addImportSources([source("a")]);
    await advance(100);
    addImportSources([source("b")]);
    await advance(CAPSULE_MIN_MS);
    assert.equal(log.refreshes, 1);
    assert.deepEqual(log.finished, [{ failed: 0, imported: 2 }]);
  });

  void test("files picked during the result line start a new batch in the same capsule", async () => {
    const log = setup();
    addImportSources([source("a")]);
    await advance(CAPSULE_MIN_MS);
    assert.equal(getImportState().finished, true);
    addImportSources([source("b")]);
    assert.equal(getImportState().finished, false);
    assert.equal(getImportState().shown.total, 1);
    await advance(CAPSULE_MIN_MS);
    assert.equal(log.refreshes, 2);
    assert.deepEqual(log.finished[1], { failed: 0, imported: 1 });
  });

  void test("a batch with failures reports them, and doesn't claim success", async () => {
    const log = setup(["b"]);
    addImportSources([source("a"), source("b")]);
    await advance(CAPSULE_MIN_MS);
    assert.deepEqual(log.reported, [["b"]]);
    assert.deepEqual(log.finished, [{ failed: 1, imported: 1 }]);
    assert.equal(log.refreshes, 1);
    assert.equal(getImportState().finished, false);
    assert.equal(getImportState().batch.total, 0);
  });

  void test("a batch where everything failed doesn't refresh", async () => {
    const log = setup(["a"]);
    addImportSources([source("a")]);
    await advance(CAPSULE_MIN_MS);
    assert.equal(log.refreshes, 0);
    assert.equal(log.nothing, 1);
    assert.deepEqual(log.reported, [["a"]]);
  });
});

void describe("a batch over Wi-Fi", () => {
  beforeEach(() => {
    mock.timers.enable({ apis: ["setTimeout", "setInterval", "Date"] });
  });
  afterEach(() => {
    mock.timers.reset();
  });

  void test("waits between files and lands once, after the last", async () => {
    const log = setup();
    setTransfersOn(true);
    uploadStarted("a", "a.mp3", 1);
    assert.equal(getImportState().shown.total, 2);
    uploadReceived(source("a"), 1);
    await advance(1000);
    assert.equal(log.refreshes, 0);
    uploadStarted("b", "b.mp3", 0);
    await advance(ABANDONED_MS);
    assert.equal(log.refreshes, 0);
    uploadReceived(source("b"), 0);
    await advance(SETTLED_MS - 1);
    assert.equal(log.refreshes, 0);
    await advance(1);
    assert.equal(log.refreshes, 1);
    assert.deepEqual(log.finished, [{ failed: 0, imported: 2 }]);
  });

  void test("a second drop soon after joins the same batch", async () => {
    const log = setup();
    setTransfersOn(true);
    uploadStarted("a", "a.mp3", 0);
    uploadReceived(source("a"), 0);
    await advance(SETTLED_MS - 100);
    uploadStarted("b", "b.mp3", 0);
    uploadReceived(source("b"), 0);
    await advance(SETTLED_MS);
    assert.equal(log.refreshes, 1);
    assert.deepEqual(log.finished, [{ failed: 0, imported: 2 }]);
  });

  void test("the sheet is told once, at the batch's first upload", () => {
    setup();
    setTransfersOn(true);
    let told = 0;
    const stop = onTransferStart(() => {
      told += 1;
    });
    uploadStarted("a", "a.mp3", 2);
    uploadReceived(source("a"), 2);
    uploadStarted("b", "b.mp3", 1);
    assert.equal(told, 1);
    stop();
  });
});

void describe("a transfer that ends early", () => {
  beforeEach(() => {
    mock.timers.enable({ apis: ["setTimeout", "setInterval", "Date"] });
  });
  afterEach(() => {
    mock.timers.reset();
  });

  void test("transfers going off finish the file on its way and land soon after", async () => {
    const log = setup();
    setTransfersOn(true);
    uploadStarted("a", "a.mp3", 5);
    setTransfersOn(false);
    // The upload is still on its way, so nothing lands.
    await advance(ABANDONED_MS);
    assert.equal(log.refreshes, 0);
    uploadReceived(source("a"), 5);
    setTransfersOn(false);
    await advance(SETTLED_MS);
    assert.equal(log.refreshes, 1);
  });

  void test("a page that goes away mid-batch doesn't hold its songs back for long", async () => {
    const log = setup();
    setTransfersOn(true);
    uploadStarted("a", "a.mp3", 9);
    uploadReceived(source("a"), 9);
    await advance(ABANDONED_MS);
    assert.equal(log.refreshes, 1);
    assert.deepEqual(log.finished, [{ failed: 0, imported: 1 }]);
  });

  void test("a broken upload is quiet: no alert, and the capsule goes", async () => {
    const log = setup();
    setTransfersOn(true);
    uploadStarted("a", "a.mp3", 0);
    uploadFailed("a");
    await advance(SETTLED_MS);
    assert.deepEqual(log.reported, []);
    assert.equal(log.refreshes, 0);
    assert.equal(log.nothing, 0);
    assert.equal(getImportState().shown.total, 0);
  });

  void test("the server stopping with an upload on its way ends quietly", async () => {
    const log = setup();
    setTransfersOn(true);
    uploadStarted("a", "a.mp3", 0);
    uploadsStopped();
    await advance(0);
    assert.equal(getImportState().shown.total, 0);
    assert.deepEqual(log.reported, []);
    uploadStarted("b", "b.mp3", 0);
    assert.equal(getImportState().shown.total, 1);
  });

  void test("staging isn't cleared while an upload could be starting", async () => {
    const log = setup();
    setTransfersOn(true);
    addImportSources([source("a")]);
    await advance(CAPSULE_MIN_MS);
    assert.equal(log.refreshes, 1);
    assert.equal(log.staged, 0);
    setTransfersOn(false);
    await advance(2000);
    addImportSources([source("b")]);
    assert.equal(log.staged, 1);
  });
});
