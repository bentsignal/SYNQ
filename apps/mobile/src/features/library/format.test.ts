import assert from "node:assert/strict";
import { test } from "node:test";

import {
  collectionSummary,
  dotted,
  songCount,
  totalDuration,
  trackNumbers,
  trackTime,
} from "./format.ts";

void test("counts songs in words", () => {
  assert.equal(songCount(1), "1 song");
  assert.equal(songCount(0), "0 songs");
  assert.equal(songCount(1204), "1,204 songs");
});

void test("writes totals in minutes, then hours and minutes", () => {
  assert.equal(totalDuration(29_000), "0 minutes");
  assert.equal(totalDuration(61_000), "1 minute");
  assert.equal(totalDuration(52 * 60_000), "52 minutes");
  assert.equal(totalDuration(60 * 60_000), "1 hour");
  assert.equal(totalDuration(124 * 60_000), "2 hours, 4 minutes");
});

void test("summarizes a collection, or says it's empty", () => {
  assert.equal(collectionSummary(14, 52 * 60_000), "14 songs, 52 minutes");
  assert.equal(collectionSummary(0, 0), "No songs");
});

void test("writes track times with padded seconds", () => {
  assert.equal(trackTime(187_000), "3:07");
  assert.equal(trackTime(3_765_000), "1:02:45");
  assert.equal(trackTime(-5), "0:00");
});

void test("joins the parts that are there", () => {
  assert.equal(dotted("Kestrel", null, "", 2021), "Kestrel · 2021");
  assert.equal(dotted(), "");
});

void test("every album track shows a number, without changing a real one", () => {
  function tracks(...numbers: (number | null)[]) {
    return numbers.map((track) => ({ track }));
  }
  assert.deepEqual(trackNumbers(tracks(null)), [1]);
  assert.deepEqual(trackNumbers(tracks(1, 2, 3)), [1, 2, 3]);
  assert.deepEqual(trackNumbers(tracks(null, null)), [1, 2]);
  assert.deepEqual(trackNumbers(tracks(5, 6, null)), [5, 6, 7]);
  // A second disc starts over.
  assert.deepEqual(trackNumbers(tracks(1, 2, 1, 2)), [1, 2, 1, 2]);
});
