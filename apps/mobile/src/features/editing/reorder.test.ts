import assert from "node:assert/strict";
import { test } from "node:test";

import { moveItems, removeItems } from "./reorder.ts";

const items = ["a", "b", "c", "d", "e"];

void test("moves down to before the target, as SwiftUI does", () => {
  assert.deepEqual(moveItems(items, [0], 3), ["b", "c", "a", "d", "e"]);
  assert.deepEqual(moveItems(items, [1], 5), ["a", "c", "d", "e", "b"]);
});

void test("moves up", () => {
  assert.deepEqual(moveItems(items, [4], 0), ["e", "a", "b", "c", "d"]);
  assert.deepEqual(moveItems(items, [3], 1), ["a", "d", "b", "c", "e"]);
});

void test("moves several, keeping their order", () => {
  assert.deepEqual(moveItems(items, [0, 2], 4), ["b", "d", "a", "c", "e"]);
});

void test("leaves the list alone when nothing moves", () => {
  assert.deepEqual(moveItems(items, [2], 2), items);
  assert.deepEqual(moveItems(items, [2], 3), items);
});

void test("removes the deleted rows", () => {
  assert.deepEqual(removeItems(items, [1, 3]), ["a", "c", "e"]);
});
