import assert from "node:assert/strict";
import { test } from "node:test";

import { createHeldPlays } from "./held-plays.ts";

function recorder() {
  const log = new Array<string>();
  const plays = createHeldPlays<string>({
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
  return { log, plays, scrollTo, visit };
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
  const { log, plays, visit } = recorder();
  visit();
  plays.record("album", 1);
  plays.record("song", 2);
  plays.leave();
  assert.deepEqual(log, ["write album,song", "show"]);
});

void test("away from a tab left at the top, plays are written and shown at once", () => {
  const { log, plays, visit } = recorder();
  visit();
  plays.leave();
  plays.record("album", 1);
  assert.deepEqual(log, ["write album", "show"]);
});

void test("left scrolled down: nothing changes, on the way out or while away", () => {
  const { log, plays, scrollTo, visit } = recorder();
  visit();
  scrollTo("down");
  plays.record("album", 1);
  plays.leave();
  plays.record("song", 2);
  assert.deepEqual(log, []);
  visit();
  assert.deepEqual(log, []);
});

void test("what waited lands the next time the tab is left at the top, in order", () => {
  const { log, plays, scrollTo, visit } = recorder();
  visit();
  scrollTo("down");
  plays.record("album", 1);
  plays.leave();
  visit();
  scrollTo("top");
  assert.deepEqual(log, []);
  plays.leave();
  assert.deepEqual(log, ["write album", "show"]);
});

void test("scrolled down, the background saves without changing the list", () => {
  const { log, plays, scrollTo, visit } = recorder();
  visit();
  scrollTo("down");
  plays.record("album", 1);
  plays.background();
  assert.deepEqual(log, ["write album"]);
  plays.leave();
  assert.deepEqual(log, ["write album"]);
});

void test("what the background saved is shown when the tab is next left at the top", () => {
  const { log, plays, scrollTo, visit } = recorder();
  visit();
  scrollTo("down");
  plays.record("album", 1);
  plays.background();
  scrollTo("top");
  plays.leave();
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
  const { log, plays, visit } = recorder();
  visit();
  plays.background();
  plays.leave();
  assert.deepEqual(log, []);
});
