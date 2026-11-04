import assert from "node:assert/strict";
import { test } from "node:test";

import type { ArtworkCluster } from "./backdrop-palette.ts";
import { luminanceOf, MAX_LUMINANCE, toLch } from "./backdrop-color.ts";
import { backdropPalette, CHARCOAL, cornerZoom } from "./backdrop-palette.ts";

function cluster(color: string, population = 1, x = 0.5, y = 0.5) {
  return { color, population, x, y } satisfies ArtworkCluster;
}

function channel(hex: string, start: number) {
  return Number.parseInt(hex.slice(start, start + 2), 16);
}

function channels(hex: string) {
  return [channel(hex, 1), channel(hex, 3), channel(hex, 5)] as const;
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

function brightest(palette: readonly { color: string }[]) {
  return Math.max(...palette.map(({ color }) => luminanceOf(color)));
}

function contrastWithWhite(hex: string) {
  return 1.05 / (luminanceOf(hex) + 0.05);
}

function hexOf(red: number, green: number, blue: number) {
  return `#${[red, green, blue]
    .map((value) => Math.round(value).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Colors all around the sRGB cube, at every kind of lightness and saturation. */
function everyColor(step: number) {
  const colors = new Array<string>();
  for (let red = 0; red <= 255; red += step) {
    for (let green = 0; green <= 255; green += step) {
      for (let blue = 0; blue <= 255; blue += step) {
        colors.push(hexOf(red, green, blue));
      }
    }
  }
  return colors;
}

const COVERS = {
  black: [cluster("#000000")],
  "black with a red ring": [
    cluster("#060608", 0.967),
    cluster("#b82a32", 0.02, 0.5, 0.5),
    cluster("#410f12", 0.013, 0.5, 0.5),
  ],
  // The clusters of a real cover that once came out green and maroon: nearly
  // black, brown art, a little green type, and a dusty pink.
  "black with brown art and green type": [
    cluster("#131110", 0.794, 0.5, 0.5),
    cluster("#362e23", 0.108, 0.46, 0.45),
    cluster("#574e3b", 0.051, 0.43, 0.44),
    cluster("#307c5e", 0.015, 0.45, 0.22),
    cluster("#a47568", 0.015, 0.42, 0.6),
    cluster("#acafab", 0.014, 0.48, 0.62),
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

void test("no cover of any color can go too bright for white text", () => {
  const colors = everyColor(51);
  for (const color of colors) {
    for (const palette of [
      backdropPalette([cluster(color)]),
      // The same color as a small area on black, and on white.
      backdropPalette([cluster(color, 0.02), cluster("#000000", 0.98)]),
      backdropPalette([cluster(color, 0.02), cluster("#ffffff", 0.98)]),
      backdropPalette([cluster(color, 0.5), cluster("#808080", 0.5)]),
    ]) {
      assert.equal(palette.length, 5, color);
      for (const swatch of palette) {
        assert.ok(
          contrastWithWhite(swatch.color) >= 6.9,
          `${color}: ${swatch.color}`,
        );
      }
    }
  }
});

void test("a bit of type or a logo can't lead a cover", () => {
  for (const { color } of backdropPalette(
    COVERS["black with brown art and green type"],
  )) {
    const hue = degrees(color);
    assert.ok(hue < 110 || hue > 200, `${color} is green at ${hue}`);
  }
});

void test("one family of hues, however many the cover has", () => {
  for (const clusters of [
    COVERS.vivid,
    [cluster("#d02020", 0.5, 0.5, 0.1), cluster("#20b040", 0.5, 0.5, 0.9)],
  ]) {
    const hues = backdropPalette(clusters).map(({ color }) => degrees(color));
    for (const a of hues) {
      for (const b of hues) assert.ok(hueSpread(a, b) < 65, `${a} and ${b}`);
    }
  }
});

void test("dim yellow is never olive", () => {
  for (const { color } of backdropPalette(COVERS["flat yellow"])) {
    const hue = degrees(color);
    assert.ok(hue < 80 || hue > 125, `${color} at ${hue}`);
  }
});

void test("dim yellow-green is green, and lemon is gold", () => {
  const grass = backdropPalette([cluster("#5a6b3a")]);
  for (const { color } of grass) {
    assert.ok(degrees(color) > 125, `grass: ${color}`);
  }
  const lemon = backdropPalette([cluster("#ffff40")]);
  for (const { color } of lemon) {
    assert.ok(degrees(color) < 80 || degrees(color) > 300, `lemon: ${color}`);
  }
});

void test("no color goes near neon", () => {
  for (const clusters of Object.values(COVERS)) {
    for (const { color } of backdropPalette(clusters)) {
      assert.ok(lch(color).c <= 0.13, color);
    }
  }
});

void test("the backdrop runs from light to dark, top to bottom", () => {
  for (const name of ["flat blue", "flat yellow", "vivid"] as const) {
    const palette = backdropPalette(COVERS[name]);
    const top = palette.reduce((a, b) => (b.y < a.y ? b : a));
    const bottom = palette.reduce((a, b) => (b.y > a.y ? b : a));
    assert.ok(luminanceOf(top.color) > luminanceOf(bottom.color) * 2, name);
  }
});

void test("a mostly black cover takes on its small area of color", () => {
  const [ring, ...rest] = backdropPalette(
    COVERS["black with a red ring"],
  ).toSorted((a, b) => luminanceOf(b.color) - luminanceOf(a.color));
  assert.ok(ring !== undefined);
  const [r, g, b] = channels(ring.color);
  assert.ok(r > g * 1.5 && r > b * 1.5, ring.color);
  // Visibly lit, not a dim average of black and a little red.
  assert.ok(luminanceOf(ring.color) > 0.04, ring.color);
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

void test("the glow goes on the side of the cover its color is on", () => {
  function glow(x: number) {
    return backdropPalette([cluster("#d02020", 1, x)]).reduce((a, b) =>
      luminanceOf(b.color) > luminanceOf(a.color) ? b : a,
    );
  }
  assert.ok(glow(0.9).x > 0.5);
  assert.ok(glow(0.1).x < 0.5);
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
