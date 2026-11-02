import assert from "node:assert/strict";
import { test } from "node:test";

import { restoreSummary } from "./restore-summary.ts";

const NOTHING = {
  albums: 0,
  artists: 0,
  filled: 0,
  playlists: 0,
  playlistsExtended: 0,
  songs: 0,
};

void test("says what a restore added", () => {
  assert.deepEqual(
    restoreSummary({
      ...NOTHING,
      albums: 1,
      artists: 2,
      playlists: 1,
      songs: 12,
    }),
    {
      message: "Added 12 songs, 1 album, 2 artists, and 1 playlist.",
      title: "Backup Restored",
    },
  );
  assert.equal(
    restoreSummary({ ...NOTHING, songs: 1, albums: 3 }).message,
    "Added 1 song and 3 albums.",
  );
  assert.equal(
    restoreSummary({ ...NOTHING, playlistsExtended: 2, songs: 4 }).message,
    "Added 4 songs. Added songs to 2 playlists.",
  );
  assert.equal(
    restoreSummary({ ...NOTHING, filled: 5 }).message,
    "Filled in missing details.",
  );
});

void test("says when there was nothing to add", () => {
  assert.equal(restoreSummary(NOTHING).title, "Nothing to Add");
});
