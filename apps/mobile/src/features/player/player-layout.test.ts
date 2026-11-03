import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ARTWORK_TOP,
  OPTION_BOX,
  PLAYER_GAP_MIN,
  PLAYER_GAPS,
  playerArtworkSize,
  TRANSPORT_BOX,
} from "./player-layout.ts";

/** The padding and grabber above, and the rows that don't give way. */
const TOP = 12 + 6;
const TITLE_ROW = 52;
const SLIDER_ROW = 20;
const ROWS = TITLE_ROW + SLIDER_ROW * 2 + TRANSPORT_BOX + OPTION_BOX;
/** The times hang this far under the scrubber's row. */
const TIMES = 16;

/** Window, width, where the modal sheet starts, and the home indicator's inset. */
const PHONES = [
  { bottom: 0, height: 667, name: "SE", sheetTop: 30, width: 375 },
  { bottom: 34, height: 812, name: "mini", sheetTop: 60, width: 375 },
  { bottom: 34, height: 844, name: "iPhone", sheetTop: 60, width: 390 },
  { bottom: 34, height: 874, name: "Pro", sheetTop: 64, width: 402 },
  { bottom: 34, height: 932, name: "Plus", sheetTop: 64, width: 430 },
  { bottom: 34, height: 956, name: "Pro Max", sheetTop: 64, width: 440 },
];

function gapsRoom(phone: (typeof PHONES)[number]) {
  return (
    phone.height -
    phone.sheetTop -
    phone.bottom -
    TOP -
    ARTWORK_TOP -
    playerArtworkSize(phone.width, phone.height) -
    ROWS
  );
}

for (const phone of PHONES) {
  void test(`everything fits with room to breathe on ${phone.name}`, () => {
    const gaps = Object.keys(PLAYER_GAPS).length + 1;
    const room = gapsRoom(phone);
    assert.ok(room >= gaps * PLAYER_GAP_MIN, `${phone.name}: ${room} pt`);
  });

  void test(`the times clear the transport on ${phone.name}`, () => {
    const total = Object.values(PLAYER_GAPS).reduce(
      (sum, gap) => sum + gap,
      PLAYER_GAPS.sliderToTransport,
    );
    const gap = (gapsRoom(phone) * PLAYER_GAPS.sliderToTransport) / total;
    assert.ok(gap >= TIMES, `${phone.name}: ${gap} pt under the scrubber`);
  });
}

void test("the artwork takes the width, and gives way on a short window", () => {
  assert.equal(playerArtworkSize(402, 874), 342);
  assert.equal(playerArtworkSize(375, 667), 307);
});
