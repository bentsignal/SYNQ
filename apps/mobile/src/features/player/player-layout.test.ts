import assert from "node:assert/strict";
import { test } from "node:test";

import { playerSpacing } from "./player-layout.ts";

/** The rows that don't give way: grabber, title, sliders, transport, options. */
const ROWS = 18 + 48 + 20 + 80 + 20 + 36;
const BOTTOM_PADDING = 12;
const ARTWORK_MARGIN = 24;

/** Window, width, where the modal sheet starts, and the home indicator's inset. */
const PHONES = [
  { bottom: 0, height: 667, name: "SE", sheetTop: 30, width: 375 },
  { bottom: 34, height: 812, name: "mini", sheetTop: 60, width: 375 },
  { bottom: 34, height: 844, name: "iPhone", sheetTop: 60, width: 390 },
  { bottom: 34, height: 874, name: "Pro", sheetTop: 64, width: 402 },
  { bottom: 34, height: 932, name: "Plus", sheetTop: 64, width: 430 },
  { bottom: 34, height: 956, name: "Pro Max", sheetTop: 64, width: 440 },
];

for (const phone of PHONES) {
  void test(`full-size artwork fits on ${phone.name}`, () => {
    const spacing = playerSpacing(phone.height);
    const gaps =
      spacing.titleToScrubber +
      spacing.sliderToTransport * 2 +
      spacing.volumeToOptions;
    const room =
      phone.height -
      phone.sheetTop -
      phone.bottom -
      BOTTOM_PADDING -
      ROWS -
      gaps -
      ARTWORK_MARGIN;
    assert.ok(
      room >= phone.width - 64,
      `${phone.name}: ${room} pt for ${phone.width - 64} pt of artwork`,
    );
  });
}

void test("the gaps grow with the phone and stop growing", () => {
  const short = playerSpacing(667);
  const tall = playerSpacing(932);
  assert.ok(tall.sliderToTransport > short.sliderToTransport);
  assert.deepEqual(playerSpacing(500), short);
  assert.deepEqual(playerSpacing(1000), tall);
});
