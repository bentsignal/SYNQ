import assert from "node:assert/strict";
import { test } from "node:test";

import { importGate } from "./free-tier.ts";

void test("free batches import their first song after the wait, then lock", () => {
  assert.equal(
    importGate({ freeSongUsed: false, premium: false }),
    "wait-then-import",
  );
  assert.equal(importGate({ freeSongUsed: true, premium: false }), "lock");
});

void test("Premium imports everything without waiting", () => {
  assert.equal(importGate({ freeSongUsed: false, premium: true }), "import");
  assert.equal(importGate({ freeSongUsed: true, premium: true }), "import");
});
