import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, mock, test } from "node:test";

import { CAPSULE_MIN_MS } from "./progress.ts";
import { advance, setup, source } from "./queue-test-kit.ts";
import {
  addImportSources,
  getImportState,
  setIncomingImports,
} from "./queue.ts";

void describe("a batch waiting on a download", () => {
  beforeEach(() => {
    mock.timers.enable({ apis: ["setTimeout", "setInterval", "Date"] });
  });
  afterEach(() => {
    mock.timers.reset();
  });

  void test("a download is one batch, counted whole from the start", async () => {
    const log = setup();
    setIncomingImports(3);
    assert.equal(getImportState().shown.total, 3);
    await advance(CAPSULE_MIN_MS);
    for (const [name, left] of [
      ["a", 2],
      ["b", 1],
    ] as const) {
      addImportSources([source(name)]);
      setIncomingImports(left);
      assert.equal(getImportState().shown.total, 3);
      await advance(CAPSULE_MIN_MS * 2);
      assert.equal(getImportState().finished, false);
      assert.equal(log.refreshes, 0);
    }
    addImportSources([source("c")]);
    setIncomingImports(0);
    await advance(CAPSULE_MIN_MS);
    assert.equal(getImportState().shown.total, 0);
    assert.equal(log.refreshes, 1);
    assert.deepEqual(log.finished, [{ failed: 0, imported: 3 }]);
  });

  void test("a paused download lets the songs so far appear", async () => {
    const log = setup();
    setIncomingImports(3);
    addImportSources([source("a")]);
    setIncomingImports(2);
    await advance(CAPSULE_MIN_MS);
    assert.equal(log.refreshes, 0);
    setIncomingImports(0);
    await advance(CAPSULE_MIN_MS);
    assert.deepEqual(log.finished, [{ failed: 0, imported: 1 }]);
    assert.equal(getImportState().finished, true);
  });

  void test("a download that brought nothing just goes away", async () => {
    const log = setup();
    setIncomingImports(3);
    await advance(0);
    setIncomingImports(0);
    await advance(0);
    assert.equal(getImportState().shown.total, 0);
    assert.equal(log.refreshes, 0);
    assert.equal(log.nothing, 0);
    assert.deepEqual(log.finished, []);
  });
});
