import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createDebouncer,
  normalizeSearch,
  SEARCH_DELAY_MS,
  shownAnswer,
} from "./debounce.ts";

function debounced() {
  const settled = new Array<string>();
  const debouncer = createDebouncer({ settle: (value) => settled.push(value) });
  return { debouncer, settled };
}

void test("settles only once typing pauses, with the last text", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { debouncer, settled } = debounced();
  debouncer.push("d");
  t.mock.timers.tick(SEARCH_DELAY_MS - 1);
  debouncer.push("da");
  t.mock.timers.tick(SEARCH_DELAY_MS - 1);
  debouncer.push("daf");
  assert.deepEqual(settled, []);
  t.mock.timers.tick(SEARCH_DELAY_MS);
  assert.deepEqual(settled, ["daf"]);
});

void test("settles empty text at once, dropping pending text", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { debouncer, settled } = debounced();
  debouncer.push("daft");
  debouncer.push("  ");
  assert.deepEqual(settled, [""]);
  t.mock.timers.tick(SEARCH_DELAY_MS * 2);
  assert.deepEqual(settled, [""]);
});

void test("cancel drops pending text", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { debouncer, settled } = debounced();
  debouncer.push("daft");
  debouncer.cancel();
  t.mock.timers.tick(SEARCH_DELAY_MS * 2);
  assert.deepEqual(settled, []);
});

void test("keeps the settled answer, query and data together, while the next loads", () => {
  const settled = { data: true, query: "daft" };
  const current = { data: undefined, query: "dafu" };
  assert.equal(shownAnswer({ current, isLoading: true, settled }), settled);
  assert.equal(shownAnswer({ current, isLoading: false, settled }), current);
});

void test("matches text trimmed and lowercased", () => {
  assert.equal(normalizeSearch("  Daft Punk "), "daft punk");
});
