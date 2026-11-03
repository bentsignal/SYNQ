import assert from "node:assert/strict";
import { test } from "node:test";

import type { ArtworkCluster } from "./backdrop-palette.ts";
import type { ArtworkColors } from "./backdrop-variants.ts";
import { luminanceOf, MAX_LUMINANCE, toLch } from "./backdrop-palette.ts";
import { CURRENT_VARIANT, VARIANTS } from "./backdrop-variants.ts";

function cluster(color: string, population = 1, x = 0.5, y = 0.5) {
  return { color, population, x, y } satisfies ArtworkCluster;
}

function lch(hex: string) {
  const color = toLch(hex);
  assert.ok(color !== null, hex);
  return color;
}

function degrees(hex: string) {
  return ((lch(hex).h * 180) / Math.PI + 360) % 360;
}

function hueSpread(a: number, b: number) {
  const delta = Math.abs(a - b) % 360;
  return delta > 180 ? 360 - delta : delta;
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
  },
  "flat yellow": { clusters: [cluster("#f6d63c")] },
  greyscale: { clusters: [cluster("#121212", 0.5), cluster("#cdcdcd", 0.5)] },
  "muted blue": { clusters: [cluster("#3f5168")] },
  "red and green": {
    clusters: [
      cluster("#d02020", 0.5, 0.5, 0.1),
      cluster("#20b040", 0.5, 0.5, 0.9),
    ],
  },
  "vivid blue": { clusters: [cluster("#1040e0")] },
} satisfies Record<string, ArtworkColors>;

function find(id: (typeof VARIANTS)[number]["id"]) {
  const variant = VARIANTS.find((candidate) => candidate.id === id);
  assert.ok(variant !== undefined, id);
  return variant;
}

/** How saturated a design is, on average. */
function meanChroma(
  id: (typeof VARIANTS)[number]["id"],
  colors: ArtworkColors,
) {
  const { swatches } = find(id).design(colors);
  return (
    swatches.reduce((sum, { color }) => sum + lch(color).c, 0) / swatches.length
  );
}

for (const variant of [CURRENT_VARIANT, ...VARIANTS]) {
  for (const [name, colors] of Object.entries(COVERS)) {
    void test(`${variant.label}, ${name}: white text reads over every color`, () => {
      const { swatches } = variant.design(colors);
      assert.equal(swatches.length, 5);
      for (const { color } of swatches) {
        assert.ok(luminanceOf(color) <= MAX_LUMINANCE + 0.003, color);
      }
    });

    void test(`${variant.label}, ${name}: the same cover gives the same colors`, () => {
      assert.deepEqual(variant.design(colors), variant.design(colors));
    });
  }
}

for (const variant of VARIANTS) {
  void test(`${variant.label}: a bit of type can't lead a cover`, () => {
    const { swatches } = variant.design(
      COVERS["black with brown art and green type"],
    );
    for (const { color } of swatches) {
      const hue = degrees(color);
      assert.ok(hue < 110 || hue > 200, `${color} is green at ${hue}`);
    }
  });

  void test(`${variant.label}: dim yellow is never olive`, () => {
    for (const { color } of variant.design(COVERS["flat yellow"]).swatches) {
      const hue = degrees(color);
      assert.ok(hue < 80 || hue > 125, `${color} at ${hue}`);
    }
  });

  void test(`${variant.label}: one family of hues, however many the cover has`, () => {
    const hues = variant
      .design(COVERS["red and green"])
      .swatches.map(({ color }) => degrees(color));
    for (const a of hues) {
      for (const b of hues) assert.ok(hueSpread(a, b) < 65, `${a} and ${b}`);
    }
  });
}

void test("Soft is less saturated than Family", () => {
  for (const [name, colors] of Object.entries(COVERS)) {
    if (name === "greyscale") continue;
    assert.ok(meanChroma("soft", colors) < meanChroma("family", colors), name);
  }
});

void test("Matched follows how saturated the cover is", () => {
  const muted = meanChroma("matched", COVERS["muted blue"]);
  const vivid = meanChroma("matched", COVERS["vivid blue"]);
  assert.ok(muted < vivid * 0.75, `${muted} and ${vivid}`);
  assert.ok(muted < meanChroma("family", COVERS["muted blue"]));
});

void test("Pure stays closer to the cover's hue than Family", () => {
  function spread(id: (typeof VARIANTS)[number]["id"]) {
    const hues = find(id)
      .design(COVERS["vivid blue"])
      .swatches.map(({ color }) => degrees(color));
    return Math.max(...hues) - Math.min(...hues);
  }
  assert.ok(spread("pure") < spread("family") * 0.5);
});

void test("Deep is darker than Family, top to bottom", () => {
  for (const [name, colors] of Object.entries(COVERS)) {
    if (name === "greyscale") continue;
    const family = find("family").design(colors).swatches;
    const deep = find("deep").design(colors).swatches;
    for (const [index, { color }] of deep.entries()) {
      const other = family[index];
      assert.ok(other !== undefined);
      assert.ok(
        luminanceOf(color) < luminanceOf(other.color),
        `${name} ${index}`,
      );
    }
  }
});
