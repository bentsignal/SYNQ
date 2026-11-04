import assert from "node:assert/strict";
import { test } from "node:test";

import type { PlaybackSource } from "./types.ts";
import { songTapEffect } from "./song-tap.ts";

const ALBUM = { id: 1, kind: "album" } satisfies PlaybackSource;
const OTHER_ALBUM = { id: 2, kind: "album" } satisfies PlaybackSource;
const LIBRARY = { kind: "library" } satisfies PlaybackSource;

function tap(
  chosenSource: PlaybackSource,
  currentSource: PlaybackSource | null,
  status: Parameters<typeof songTapEffect>[0]["status"] = "playing",
) {
  return songTapEffect({
    chosen: { songId: 7, source: chosenSource },
    current: { songId: 7, source: currentSource },
    status,
  });
}

void test("the song playing, from the same list, carries on", () => {
  assert.equal(tap(ALBUM, ALBUM), "carry-on");
  assert.equal(tap(LIBRARY, LIBRARY), "carry-on");
});

void test("paused or still loading counts as on", () => {
  assert.equal(tap(ALBUM, ALBUM, "paused"), "carry-on");
  assert.equal(tap(ALBUM, ALBUM, "loading"), "carry-on");
});

void test("the song playing, from another list, carries on with that list", () => {
  assert.equal(tap(LIBRARY, ALBUM), "carry-on-with-new-list");
  assert.equal(tap(OTHER_ALBUM, ALBUM), "carry-on-with-new-list");
  assert.equal(tap(ALBUM, null), "carry-on-with-new-list");
});

void test("a song that finished or failed starts again", () => {
  assert.equal(tap(ALBUM, ALBUM, "ended"), "start");
  assert.equal(tap(ALBUM, ALBUM, "error"), "start");
  assert.equal(tap(ALBUM, ALBUM, "idle"), "start");
});

void test("another song starts", () => {
  assert.equal(
    songTapEffect({
      chosen: { songId: 8, source: ALBUM },
      current: { songId: 7, source: ALBUM },
      status: "playing",
    }),
    "start",
  );
});

void test("Play and Shuffle choose no song, so they start", () => {
  assert.equal(
    songTapEffect({
      chosen: null,
      current: { songId: 7, source: ALBUM },
      status: "playing",
    }),
    "start",
  );
});

void test("nothing playing starts", () => {
  assert.equal(
    songTapEffect({
      chosen: { songId: 7, source: ALBUM },
      current: null,
      status: "idle",
    }),
    "start",
  );
});
