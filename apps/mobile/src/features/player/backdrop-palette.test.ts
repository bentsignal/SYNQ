import assert from "node:assert/strict";
import { test } from "node:test";

import type { ArtworkCluster } from "./backdrop-palette.ts";
import {
  backdropPalette,
  CHARCOAL,
  cornerZoom,
  luminanceOf,
  MAX_LUMINANCE,
} from "./backdrop-palette.ts";

function cluster(color: string, population = 1, x = 0.5, y = 0.5) {
  return { color, population, x, y } satisfies ArtworkCluster;
}

function channel(hex: string, start: number) {
  return Number.parseInt(hex.slice(start, start + 2), 16);
}

function channels(hex: string) {
  return [channel(hex, 1), channel(hex, 3), channel(hex, 5)] as const;
}

function brightest(palette: readonly { color: string }[]) {
  return Math.max(...palette.map(({ color }) => luminanceOf(color)));
}

function contrastWithWhite(hex: string) {
  return 1.05 / (luminanceOf(hex) + 0.05);
}

const COVERS = {
  black: [cluster("#000000")],
  "black with a red ring": [
    cluster("#060608", 0.967),
    cluster("#b82a32", 0.02, 0.5, 0.5),
    cluster("#410f12", 0.013, 0.5, 0.5),
  ],
  "flat blue": [cluster("#264aaa")],
  "flat yellow": [cluster("#f6d63c")],
  greyscale: [
    cluster("#121212", 0.3, 0.2, 0.2),
    cluster("#5a5a5a", 0.4, 0.4, 0.6),
    cluster("#cdcdcd", 0.3, 0.8, 0.8),
  ],
  "nearly white": [
    cluster("#f6f4f0", 0.95),
    cluster("#e85c3c", 0.03),
    cluster("#282828", 0.02),
  ],
  "pure white": [cluster("#ffffff")],
  vivid: [
    cluster("#ff2878", 0.3, 0.1, 0.9),
    cluster("#ffb414", 0.3, 0.9, 0.5),
    cluster("#1450ff", 0.2, 0.8, 0.1),
    cluster("#14e696", 0.2, 0.1, 0.1),
  ],
} satisfies Record<string, ArtworkCluster[]>;

for (const [name, clusters] of Object.entries(COVERS)) {
  void test(`${name}: white text reads over every color`, () => {
    const palette = backdropPalette(clusters);
    assert.equal(palette.length, 5);
    // Rounding to 8 bits can land a hair over.
    assert.ok(brightest(palette) <= MAX_LUMINANCE + 0.002, name);
    for (const { color } of palette) {
      assert.ok(contrastWithWhite(color) >= 6.9, `${name}: ${color}`);
    }
  });

  void test(`${name}: the same cover gives the same colors`, () => {
    assert.deepEqual(backdropPalette(clusters), backdropPalette(clusters));
  });
}

void test("a mostly black cover takes on its small area of color", () => {
  const [ring, ...rest] = backdropPalette(
    COVERS["black with a red ring"],
  ).toSorted((a, b) => luminanceOf(b.color) - luminanceOf(a.color));
  assert.ok(ring !== undefined);
  const [r, g, b] = channels(ring.color);
  assert.ok(r > g * 1.5 && r > b * 1.5, ring.color);
  // Visibly lit, not a dim average of black and a little red.
  assert.ok(luminanceOf(ring.color) > 0.05, ring.color);
  assert.ok(rest.length > 0);
});

void test("a tiny speck of noise doesn't color a black cover", () => {
  const palette = backdropPalette([
    cluster("#050505", 0.999),
    cluster("#ff0000", 0.001),
  ]);
  for (const { color } of palette) {
    const [r, g, b] = channels(color);
    assert.ok(Math.max(r, g, b) - Math.min(r, g, b) < 8, color);
  }
});

void test("a monochrome cover has depth in its own tones", () => {
  for (const name of ["black", "pure white", "greyscale"] as const) {
    const palette = backdropPalette(COVERS[name]);
    const values = palette.map(({ color }) => luminanceOf(color));
    assert.ok(Math.max(...values) / Math.min(...values) > 1.8, name);
    for (const { color } of palette) {
      const [r, g, b] = channels(color);
      assert.ok(Math.max(r, g, b) - Math.min(r, g, b) < 8, `${name}: ${color}`);
    }
  }
});

void test("light covers sit lighter than dark ones", () => {
  const whites = brightest(backdropPalette(COVERS["pure white"]));
  const blacks = brightest(backdropPalette(COVERS.black));
  assert.ok(whites > blacks);
});

void test("a flat color fills the screen, with no black ground", () => {
  for (const { color } of backdropPalette(COVERS["flat blue"])) {
    assert.ok(luminanceOf(color) > 0.012, color);
  }
});

void test("the pools stay where the art runs", () => {
  const palette = backdropPalette([
    cluster("#d02020", 0.5, 0.5, 0),
    cluster("#2030d0", 0.5, 0.5, 1),
  ]);
  const red = palette.find(({ color }) => {
    const [r, , b] = channels(color);
    return r > b * 2;
  });
  const blue = palette.find(({ color }) => {
    const [r, , b] = channels(color);
    return b > r * 2;
  });
  assert.ok(red !== undefined && blue !== undefined);
  assert.ok(red.y < blue.y);
});

void test("no colors at all gives the charcoal", () => {
  assert.deepEqual(backdropPalette([]), CHARCOAL);
  assert.equal(CHARCOAL.length, 5);
  assert.deepEqual(
    backdropPalette([{ color: "nope", population: 1, x: 0, y: 0 }]),
    CHARCOAL,
  );
});

void test("a cover that reaches its corners isn't zoomed", () => {
  assert.equal(cornerZoom(0, 329, 12), 1);
  assert.equal(cornerZoom(0, 0, 12), 1);
});

void test("the zoom puts a cover's own corners past the clip", () => {
  const size = 329;
  const radius = 12;
  const inset = 0.04;
  const zoom = cornerZoom(inset, size, radius);
  assert.ok(zoom > 1 && zoom < 1.1, String(zoom));
  // On the diagonal, where the art starts after scaling about the center...
  const start = 0.5 - (0.5 - inset) * zoom;
  // ...is no further in than where the clip's corner starts.
  assert.ok(start * size <= radius * (1 - Math.SQRT1_2) + 1e-9);
});

void test("corners inside the clip's own radius need no zoom", () => {
  assert.equal(cornerZoom(0.005, 329, 12), 1);
});
