import assert from "node:assert/strict";
import { test } from "node:test";

import { createHeldPlays } from "./held-plays.ts";

function recorder() {
  const log = new Array<string>();
  let leaving = new Array<() => void>();
  const plays = createHeldPlays<string>({
    afterLeaving: (then) => {
      leaving.push(then);
      return () => {
        leaving = [];
      };
    },
    show: () => log.push("show"),
    write: (batch) => {
      log.push(`write ${batch.map(({ item }) => item).join(",")}`);
    },
  });
  let top = true;
  function scrollTo(place: "top" | "down") {
    top = place === "top";
  }
  function visit() {
    plays.arrive(() => top);
  }
  /** The tab has finished going off screen. */
  function finishLeaving() {
    const finished = leaving;
    leaving = [];
    for (const then of finished) then();
  }
  /** Leaves the tab and lets it finish. */
  function leave() {
    plays.leave();
    finishLeaving();
  }
  return { finishLeaving, leave, log, plays, scrollTo, visit };
}

void test("before the tab has been opened, a play is written and shown at once", () => {
  const { log, plays } = recorder();
  plays.record("album", 1);
  assert.deepEqual(log, ["write album", "show"]);
});

void test("a play waits while the tab is on screen, even at the top", () => {
  const { log, plays, visit } = recorder();
  visit();
  plays.record("album", 1);
  assert.deepEqual(log, []);
});

void test("left at the top: what was played is there on the way back", () => {
  const { leave, log, plays, visit } = recorder();
  visit();
  plays.record("album", 1);
  plays.record("song", 2);
  leave();
  assert.deepEqual(log, ["write album,song", "show"]);
});

void test("away from a tab left at the top, plays are written and shown at once", () => {
  const { leave, log, plays, visit } = recorder();
  visit();
  leave();
  plays.record("album", 1);
  assert.deepEqual(log, ["write album", "show"]);
});

void test("left scrolled down: nothing changes, on the way out or while away", () => {
  const { leave, log, plays, scrollTo, visit } = recorder();
  visit();
  scrollTo("down");
  plays.record("album", 1);
  leave();
  plays.record("song", 2);
  assert.deepEqual(log, []);
  visit();
  assert.deepEqual(log, []);
});

void test("what waited lands the next time the tab is left at the top, in order", () => {
  const { leave, log, plays, scrollTo, visit } = recorder();
  visit();
  scrollTo("down");
  plays.record("album", 1);
  leave();
  visit();
  scrollTo("top");
  assert.deepEqual(log, []);
  leave();
  assert.deepEqual(log, ["write album", "show"]);
});

void test("scrolled down, the background saves without changing the list", () => {
  const { leave, log, plays, scrollTo, visit } = recorder();
  visit();
  scrollTo("down");
  plays.record("album", 1);
  plays.background();
  assert.deepEqual(log, ["write album"]);
  leave();
  assert.deepEqual(log, ["write album"]);
});

void test("what the background saved is shown when the tab is next left at the top", () => {
  const { leave, log, plays, scrollTo, visit } = recorder();
  visit();
  scrollTo("down");
  plays.record("album", 1);
  plays.background();
  scrollTo("top");
  leave();
  assert.deepEqual(log, ["write album", "show"]);
});

void test("at the top, the background counts as leaving", () => {
  const { log, plays, visit } = recorder();
  visit();
  plays.record("album", 1);
  plays.background();
  assert.deepEqual(log, ["write album", "show"]);
});

void test("nothing waiting writes and shows nothing", () => {
  const { leave, log, plays, visit } = recorder();
  visit();
  plays.background();
  leave();
  assert.deepEqual(log, []);
});

void test("nothing changes until the tab has finished going off screen", () => {
  const { finishLeaving, log, plays, visit } = recorder();
  visit();
  plays.record("album", 1);
  plays.leave();
  assert.deepEqual(log, []);
  plays.record("song", 2);
  assert.deepEqual(log, []);
  finishLeaving();
  assert.deepEqual(log, ["write album,song", "show"]);
});

void test("coming back before it's off screen leaves everything as it was", () => {
  const { finishLeaving, log, plays, visit } = recorder();
  visit();
  plays.record("album", 1);
  plays.leave();
  visit();
  finishLeaving();
  assert.deepEqual(log, []);
  plays.leave();
  finishLeaving();
  assert.deepEqual(log, ["write album", "show"]);
});
