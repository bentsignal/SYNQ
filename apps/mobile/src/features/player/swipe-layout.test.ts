import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ACTION_GAP,
  actionAt,
  actionFrames,
  fullDistance,
  openDistance,
} from "./swipe-layout.ts";

const WIDTHS = [120, 100];

/** The two capsules' frames. */
function framesAt(revealed: number, armed: number) {
  const [first, second] = actionFrames(WIDTHS, revealed, armed);
  assert.ok(first && second);
  return { first, second };
}

void test("an open row shows each capsule at full size, a gap apart", () => {
  const open = openDistance(WIDTHS);
  assert.equal(open, ACTION_GAP * 3 + 220);
  const { first, second } = framesAt(open, 0);
  assert.deepEqual(first, {
    length: 120,
    opacity: 1,
    scale: 1,
    start: ACTION_GAP,
  });
  assert.deepEqual(second, {
    length: 100,
    opacity: 1,
    scale: 1,
    start: ACTION_GAP * 2 + 120,
  });
});

void test("opening, the capsules grow in from small over what's uncovered", () => {
  const open = openDistance(WIDTHS);
  const { first, second } = framesAt(open / 2, 0);
  assert.equal(first.scale, 0.75);
  assert.equal(first.opacity, 0.5);
  // Its center is halfway to where it ends up.
  assert.equal(first.start + 60, (ACTION_GAP + 60) / 2);
  assert.equal(second.opacity, 0.5);
});

void test("past open, the first stretches and the others stay beside the row", () => {
  const open = openDistance(WIDTHS);
  const { first, second } = framesAt(open + 40, 0);
  assert.equal(first.length, 160);
  assert.equal(second.start, ACTION_GAP * 2 + 120 + 40);
});

void test("armed, the first takes the whole space and the others fade", () => {
  const revealed = 340;
  const { first, second } = framesAt(revealed, 1);
  assert.equal(first.start, ACTION_GAP);
  assert.equal(first.length, revealed - ACTION_GAP * 2);
  assert.equal(second.opacity, 0);
});

void test("a full swipe is always past the open buttons", () => {
  assert.equal(fullDistance([44], 400), 200);
  assert.equal(fullDistance(WIDTHS, 400), openDistance(WIDTHS) + 32);
});

void test("a tap on an open row finds the capsule under it", () => {
  assert.equal(actionAt(WIDTHS, ACTION_GAP + 1), 0);
  assert.equal(actionAt(WIDTHS, ACTION_GAP + 125), 1);
  assert.equal(actionAt(WIDTHS, openDistance(WIDTHS) + 20), -1);
});
