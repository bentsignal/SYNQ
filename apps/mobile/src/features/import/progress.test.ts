import assert from "node:assert/strict";
import { describe, test } from "node:test";

import type { BatchCounts, Transfer } from "./progress.ts";
import {
  ABANDONED_MS,
  CAPSULE_MIN_MS,
  capsuleHold,
  capsuleLine,
  capsuleTarget,
  completionDelay,
  failureReport,
  finishedLine,
  isBatchActive,
  NEW_TRANSFER,
  NO_COUNT,
  parseUploadType,
  SETTLED_MS,
  startsTransfer,
  stepCapsule,
  UNANNOUNCED_MS,
  withNothingAnnounced,
} from "./progress.ts";

function batch(total: number, imported: number, failed = 0) {
  return { failed, imported, total } satisfies BatchCounts;
}

function transfer(change: Partial<Transfer>) {
  return { ...NEW_TRANSFER, ...change } satisfies Transfer;
}

const uploading = { a: { name: "a.mp3" } };

void describe("completionDelay", () => {
  void test("never completes before anything has arrived", () => {
    assert.equal(completionDelay(NEW_TRANSFER, batch(0, 0)), null);
  });

  void test("a picked batch completes with its last file", () => {
    assert.equal(completionDelay(NEW_TRANSFER, batch(3, 2)), null);
    assert.equal(completionDelay(NEW_TRANSFER, batch(3, 3)), 0);
    assert.equal(completionDelay(NEW_TRANSFER, batch(3, 2, 1)), 0);
  });

  void test("turning transfers off ends the wait for what the page queued", () => {
    const waiting = transfer({ announced: 4, received: 1 });
    assert.equal(completionDelay(waiting, batch(1, 1)), ABANDONED_MS);
    assert.equal(
      completionDelay(withNothingAnnounced(waiting), batch(1, 1)),
      SETTLED_MS,
    );
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

void describe("isBatchActive", () => {
  void test("is on while anything is importing or on its way", () => {
    assert.equal(isBatchActive(batch(0, 0), NEW_TRANSFER), false);
    assert.equal(isBatchActive(batch(1, 0), NEW_TRANSFER), true);
    assert.equal(
      isBatchActive(batch(0, 0), transfer({ uploads: uploading })),
      true,
    );
  });
});

void describe("startsTransfer", () => {
  void test("only the first upload of a batch starts one", () => {
    assert.equal(startsTransfer(NEW_TRANSFER), true);
    assert.equal(startsTransfer(transfer({ uploads: uploading })), false);
    assert.equal(startsTransfer(transfer({ received: 1 })), false);
  });
});

void describe("the capsule's count", () => {
  void test("counts what's known, including what's on its way", () => {
    assert.deepEqual(
      capsuleTarget(
        batch(3, 1, 1),
        transfer({ announced: 4, uploads: uploading }),
      ),
      { done: 2, total: 8 },
    );
  });

  void test("rises gradually when files fly through", () => {
    const steps = [NO_COUNT];
    const target = { done: 100, total: 100 };
    for (let tick = 0; tick < 4; tick += 1) {
      const last = steps.at(-1) ?? NO_COUNT;
      steps.push(stepCapsule(last, target));
    }
    assert.deepEqual(
      steps.map(({ done }) => done),
      [0, 25, 44, 58, 69],
    );
  });

  void test("catches up one at a time at the end", () => {
    assert.equal(
      stepCapsule({ done: 11, total: 12 }, { done: 12, total: 12 }).done,
      12,
    );
    assert.equal(
      stepCapsule({ done: 12, total: 12 }, { done: 12, total: 12 }).done,
      12,
    );
  });

  void test("never reads a smaller total during a batch", () => {
    assert.equal(
      stepCapsule({ done: 2, total: 12 }, { done: 2, total: 9 }).total,
      12,
    );
  });

  void test("stays up a minimum time", () => {
    assert.equal(capsuleHold(1000, 1000), CAPSULE_MIN_MS);
    assert.equal(capsuleHold(1000, 1000 + CAPSULE_MIN_MS + 5), 0);
  });

  void test("says what's happening, then the result", () => {
    assert.equal(capsuleLine({ done: 0, total: 12 }), "Importing 1 of 12");
    assert.equal(capsuleLine({ done: 2, total: 12 }), "Importing 3 of 12");
    assert.equal(capsuleLine({ done: 12, total: 12 }), "Importing 12 of 12");
    assert.equal(capsuleLine({ done: 0, total: 1 }), "Importing 1 Song");
    assert.equal(finishedLine(12), "12 Songs Imported");
    assert.equal(finishedLine(1), "1 Song Imported");
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
