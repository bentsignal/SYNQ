import assert from "node:assert/strict";
import { test } from "node:test";

import { backdropColors, dimmed, luminance } from "./backdrop-colors.ts";

void test("dims light colors until white text reads over them", () => {
  const color = dimmed("#e4d6b4");
  assert.ok(color !== null);
  assert.ok(luminance(color) <= 0.121);
  // Keeps the hue: red stays the largest channel of a warm beige.
  const [r, g, b] = [1, 3, 5].map((i) =>
    Number.parseInt(color.slice(i, i + 2), 16),
  );
  assert.ok(
    r !== undefined && g !== undefined && b !== undefined && r >= g && g >= b,
  );
});

void test("leaves dark colors as they are", () => {
  assert.equal(dimmed("#102030"), "#102030");
});

void test("needs at least one readable color", () => {
  assert.equal(backdropColors([]), null);
  assert.equal(backdropColors(["nope"]), null);
  assert.deepEqual(backdropColors(["#000000"]), ["#000000", "#000000"]);
});
