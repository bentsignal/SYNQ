import assert from "node:assert/strict";
import { test } from "node:test";

import { downloadLine } from "./job-counts.ts";

const NOTHING = { done: 0, failed: 0, message: null, total: 0 };

void test("one song needs no count", () => {
  assert.equal(downloadLine(NOTHING), null);
  assert.equal(downloadLine({ ...NOTHING, total: 1 }), null);
  assert.equal(downloadLine({ ...NOTHING, done: 1, total: 1 }), null);
});

void test("a list counts the song it's on, and never runs past the end", () => {
  assert.equal(downloadLine({ ...NOTHING, total: 12 }), "1 of 12");
  assert.equal(
    downloadLine({ ...NOTHING, done: 2, failed: 1, total: 12 }),
    "4 of 12",
  );
  assert.equal(downloadLine({ ...NOTHING, done: 12, total: 12 }), "12 of 12");
});

void test("a message comes first", () => {
  assert.equal(
    downloadLine({ ...NOTHING, message: "No can do.", total: 12 }),
    "No can do.",
  );
});
