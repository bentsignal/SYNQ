import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { createIconState } from "./icon-state.ts";

/**
 * A native module that counts reads and lets the test settle each switch.
 * `applied` is the icon iOS shows, which a failed switch may still change.
 */
function fakeNative(initial: string | null) {
  const pending = new Array<{
    resolve: () => void;
    reject: (error: Error) => void;
  }>();
  const native = {
    applied: initial,
    reads: 0,
    getAppIconName() {
      native.reads += 1;
      return native.applied;
    },
    setAlternateAppIcon(name: string | null) {
      return new Promise<string | null>((resolve, reject) => {
        pending.push({
          resolve: () => {
            native.applied = name;
            resolve(name);
          },
          reject,
        });
      });
    },
  };
  return { native, pending };
}

void describe("app icon state", () => {
  void test("asks native once", () => {
    const { native } = fakeNative("icon-mint");
    const state = createIconState(native);
    assert.equal(state.get(), "icon-mint");
    assert.equal(state.get(), "icon-mint");
    assert.equal(native.reads, 1);
  });

  void test("never asks native while a switch waits for iOS's alert", async () => {
    const { native, pending } = fakeNative("icon-mint");
    const state = createIconState(native);
    let changes = 0;
    state.subscribe(() => (changes += 1));
    const switched = state.set("icon-blue");
    // A second premium check during the alert reads the icon again.
    assert.equal(state.get(), "icon-blue");
    assert.equal(native.reads, 1);
    assert.equal(changes, 1);
    pending[0]?.resolve();
    assert.equal(await switched, "icon-blue");
    assert.equal(state.get(), "icon-blue");
    assert.equal(native.reads, 1);
  });

  void test("goes back to the previous icon when iOS refuses", async () => {
    const { native, pending } = fakeNative(null);
    const state = createIconState(native);
    const switched = state.set("icon-red");
    assert.equal(state.get(), "icon-red");
    pending[0]?.reject(new Error("refused"));
    await assert.rejects(switched, /refused/);
    assert.equal(state.get(), null);
  });

  void test("keeps the new icon when iOS reports an error but switched anyway", async () => {
    // Seen when iOS's alert was dismissed without OK: "Connection reset by peer".
    const { native, pending } = fakeNative("icon-mint");
    const state = createIconState(native);
    const switched = state.set("icon-blue");
    native.applied = "icon-blue";
    pending[0]?.reject(new Error("Connection reset by peer"));
    await assert.rejects(switched, /reset/);
    assert.equal(state.get(), "icon-blue");
  });

  void test("doesn't ask native after a failed switch while another waits", async () => {
    const { native, pending } = fakeNative("icon-mint");
    const state = createIconState(native);
    const first = state.set("icon-red");
    const second = state.set("icon-pink");
    pending[0]?.reject(new Error("refused"));
    await assert.rejects(first, /refused/);
    assert.equal(native.reads, 1);
    assert.equal(state.get(), "icon-pink");
    pending[1]?.resolve();
    assert.equal(await second, "icon-pink");
  });

  void test("without the native module, there's no icon and nothing to switch", async () => {
    const state = createIconState(null);
    assert.equal(state.get(), null);
    assert.equal(await state.set("icon-blue"), null);
    assert.equal(state.get(), null);
  });
});
