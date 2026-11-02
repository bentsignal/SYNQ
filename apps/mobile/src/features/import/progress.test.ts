import assert from "node:assert/strict";
import { describe, test } from "node:test";

import type { BatchCounts, Transfer } from "./progress.ts";
import {
  ABANDONED_MS,
  batchLine,
  completionDelay,
  failureReport,
  NEW_TRANSFER,
  parseUploadType,
  SETTLED_MS,
  transferView,
  UNANNOUNCED_MS,
} from "./progress.ts";

function batch(total: number, imported: number, failed = 0) {
  return { failed, imported, total } satisfies BatchCounts;
}

function transfer(change: Partial<Transfer>) {
  return { ...NEW_TRANSFER, ...change } satisfies Transfer;
}

const uploading = { a: { fraction: 0.5, name: "a.mp3" } };

void describe("completionDelay", () => {
  void test("never completes before anything has arrived", () => {
    assert.equal(completionDelay(NEW_TRANSFER, batch(0, 0)), null);
  });

  void test("never completes while a file is on its way", () => {
    assert.equal(
      completionDelay(transfer({ uploads: uploading }), batch(0, 0)),
      null,
    );
    assert.equal(
      completionDelay(
        transfer({ announced: 0, received: 3, uploads: uploading }),
        batch(3, 3),
      ),
      null,
    );
  });

  void test("never completes while a received file is still importing", () => {
    assert.equal(
      completionDelay(transfer({ announced: 0, received: 3 }), batch(3, 2)),
      null,
    );
  });

  void test("settles quickly when the page says nothing follows", () => {
    assert.equal(
      completionDelay(transfer({ announced: 0, received: 3 }), batch(3, 3)),
      SETTLED_MS,
    );
  });

  void test("holds on between files when the page says more follow", () => {
    assert.equal(
      completionDelay(transfer({ announced: 2, received: 1 }), batch(1, 1)),
      ABANDONED_MS,
    );
  });

  void test("waits longer when the page hasn't said", () => {
    assert.equal(
      completionDelay(transfer({ received: 1 }), batch(1, 1)),
      UNANNOUNCED_MS,
    );
  });

  void test("counts a transfer whose only upload broke off as finished", () => {
    assert.equal(
      completionDelay(transfer({ lost: 1 }), batch(1, 0, 1)),
      UNANNOUNCED_MS,
    );
  });
});

void describe("parseUploadType", () => {
  void test("splits the count the page adds from the file's type", () => {
    assert.deepEqual(parseUploadType("audio/mpeg; synq-remaining=3"), {
      mimeType: "audio/mpeg",
      remaining: 3,
    });
    assert.deepEqual(parseUploadType("audio/mp4;synq-remaining=0"), {
      mimeType: "audio/mp4",
      remaining: 0,
    });
  });

  void test("leaves a type without one alone", () => {
    assert.deepEqual(parseUploadType("audio/mpeg"), {
      mimeType: "audio/mpeg",
      remaining: null,
    });
  });
});

void describe("batchLine", () => {
  void test("counts the song being imported", () => {
    assert.equal(batchLine(batch(12, 0)), "Importing 1 of 12");
    assert.equal(batchLine(batch(12, 2)), "Importing 3 of 12");
  });

  void test("leaves failed files out of the count", () => {
    assert.equal(batchLine(batch(12, 2, 2)), "Importing 3 of 10");
  });

  void test("says what was imported when done", () => {
    assert.equal(batchLine(batch(12, 12)), "12 Songs Imported");
    assert.equal(batchLine(batch(1, 1)), "1 Song Imported");
  });
});

void describe("transferView", () => {
  void test("is null before anything has arrived", () => {
    assert.equal(transferView(NEW_TRANSFER, batch(0, 0)), null);
  });

  void test("shows the first file alone until the page says how many follow", () => {
    assert.deepEqual(
      transferView(transfer({ uploads: uploading }), batch(0, 0)),
      {
        done: false,
        fraction: 0.5,
        line: "Receiving",
        name: "a.mp3",
      },
    );
  });

  void test("measures the whole transfer once it knows the total", () => {
    assert.deepEqual(
      transferView(
        transfer({ announced: 2, received: 1, uploads: uploading }),
        batch(1, 1),
      ),
      {
        done: false,
        fraction: 1.5 / 4,
        line: "Receiving 2 of 4",
        name: "a.mp3",
      },
    );
  });

  void test("stays on receiving in the gap between files", () => {
    assert.deepEqual(
      transferView(transfer({ announced: 2, received: 1 }), batch(1, 1)),
      { done: false, fraction: 1 / 3, line: "Receiving 2 of 3", name: null },
    );
  });

  void test("moves to importing, then done", () => {
    const received = transfer({ announced: 0, received: 3 });
    assert.deepEqual(transferView(received, batch(3, 1)), {
      done: false,
      fraction: 1,
      line: "Importing 2 of 3",
      name: null,
    });
    assert.deepEqual(transferView(received, batch(3, 3)), {
      done: true,
      fraction: 1,
      line: "3 Songs Imported",
      name: null,
    });
  });
});

void describe("failureReport", () => {
  void test("names one file", () => {
    assert.deepEqual(failureReport(["a.mp3"]), {
      message: "a.mp3",
      title: "Couldn't Import 1 File",
    });
  });

  void test("names the first few and counts the rest", () => {
    const names = ["a", "b", "c", "d", "e", "f", "g"];
    assert.deepEqual(failureReport(names), {
      message: "a\nb\nc\nd\ne\nand 2 more",
      title: "Couldn't Import 7 Files",
    });
  });
});
