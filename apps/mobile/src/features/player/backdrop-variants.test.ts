import assert from "node:assert/strict";
import { test } from "node:test";

import type { ArtworkCluster } from "./backdrop-palette.ts";
import type { ArtworkColors } from "./backdrop-variants.ts";
import { luminanceOf, MAX_LUMINANCE, toLch } from "./backdrop-palette.ts";
import { VARIANTS } from "./backdrop-variants.ts";

function cluster(color: string, population = 1, x = 0.5, y = 0.5) {
  return { color, population, x, y } satisfies ArtworkCluster;
}

function degrees(hex: string) {
  const lch = toLch(hex);
  assert.ok(lch !== null, hex);
  return ((lch.h * 180) / Math.PI + 360) % 360;
}

/** A 5×5 cover: `top` over `bottom`. */
function grid(top: string, bottom: string) {
  return Array.from({ length: 25 }, (_, index) => (index < 12 ? top : bottom));
}

const COVERS = {
  // The clusters SYNQ reads from a real cover that came out green and maroon:
  // nearly black, brown art, a little green type, and a dusty pink.
  "black with brown art and green type": {
    clusters: [
      cluster("#131110", 0.794, 0.5, 0.5),
      cluster("#362e23", 0.108, 0.46, 0.45),
      cluster("#574e3b", 0.051, 0.43, 0.44),
      cluster("#307c5e", 0.015, 0.45, 0.22),
      cluster("#a47568", 0.015, 0.42, 0.6),
      cluster("#acafab", 0.014, 0.48, 0.62),
    ],
    grid: grid("#1f3d34", "#2d2118"),
  },
  "flat yellow": {
    clusters: [cluster("#f6d63c")],
    grid: grid("#f6d63c", "#f6d63c"),
  },
  greyscale: {
    clusters: [cluster("#121212", 0.5), cluster("#cdcdcd", 0.5)],
    grid: grid("#121212", "#cdcdcd"),
  },
  "red and green": {
    clusters: [
      cluster("#d02020", 0.5, 0.5, 0.1),
      cluster("#20b040", 0.5, 0.5, 0.9),
    ],
    grid: grid("#d02020", "#20b040"),
  },
  "no grid, from an older build": { clusters: [cluster("#264aaa")] },
} satisfies Record<string, ArtworkColors>;

for (const variant of VARIANTS) {
  for (const [name, colors] of Object.entries(COVERS)) {
    void test(`${variant.label}, ${name}: the text sits on a dark enough backdrop`, () => {
      const { swatches } = variant.design(colors);
      assert.ok(swatches.length > 0);
      for (const { color, y } of swatches) {
        // Glow may be bright behind the artwork, and nowhere near the text.
        const limit = y < 0.2 ? 0.3 : MAX_LUMINANCE;
        assert.ok(luminanceOf(color) <= limit + 0.003, `${y}: ${color}`);
      }
    });

    void test(`${variant.label}, ${name}: the same cover gives the same colors`, () => {
      assert.deepEqual(variant.design(colors), variant.design(colors));
    });
  }
}

const NEW = VARIANTS.filter((variant) => variant.id !== "current");

for (const variant of NEW) {
  void test(`${variant.label}: a bit of type can't lead a cover`, () => {
    const { swatches } = variant.design({
      clusters: COVERS["black with brown art and green type"].clusters,
    });
    for (const { color } of swatches) {
      const hue = degrees(color);
      assert.ok(hue < 110 || hue > 200, `${color} is green at ${hue}`);
    }
  });

  void test(`${variant.label}: dim yellow is never olive`, () => {
    const { swatches } = variant.design(COVERS["flat yellow"]);
    for (const { color } of swatches) {
      if (luminanceOf(color) > MAX_LUMINANCE) continue;
      const hue = degrees(color);
      assert.ok(hue < 80 || hue > 125, `${color} at ${hue}`);
    }
  });
}

for (const id of ["family", "glow"]) {
  void test(`${id}: one family of hues, however many the cover has`, () => {
    const variant = VARIANTS.find((candidate) => candidate.id === id);
    assert.ok(variant !== undefined);
    const hues = variant
      .design(COVERS["red and green"])
      .swatches.map(({ color }) => degrees(color));
    function spread(a: number, b: number) {
      const delta = Math.abs(a - b) % 360;
      return delta > 180 ? 360 - delta : delta;
    }
    for (const a of hues) {
      for (const b of hues) assert.ok(spread(a, b) < 65, `${a} and ${b}`);
    }
  });
}
