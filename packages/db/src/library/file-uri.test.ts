import assert from "node:assert/strict";
import { test } from "node:test";

import { encodedPath } from "./file-uri.ts";

/** Real 2.5.2 file names, and the characters that have broken playback. */
const NAMES = [
  "Kendrick Lamar - Black Friday [ ezmp3.cc ] 2.mp3",
  "Matt Hardy - Trippie Redd ft. Juice WRLD {OG Version}.mp3",
  "Osamason â€“ Come Get Wit It [prod Skai + Warren Hunter].mp3",
  "9th Wonder, Dee-1, Thurz & Rapsody - Part Of The Game [prod. 9th Wonder].mp3",
  "Beyoncé - Déjà Vu.m4a",
  "日本語の曲.mp3",
  "100% #1? take.mp3",
  "already%20encoded.mp3",
];

for (const name of NAMES) {
  void test(`a path comes back as it was: ${name}`, () => {
    const encoded = encodedPath(`library/7/${name}`);
    assert.deepEqual(encoded.split("/").map(decodeURIComponent), [
      "library",
      "7",
      name,
    ]);
  });

  void test(`nothing in the URI needs repairing: ${name}`, () => {
    const encoded = encodedPath(`library/7/${name}`);
    // What URL(string:) on iOS 17 and later would re-encode, and anything that
    // isn't printable ASCII.
    assert.doesNotMatch(encoded, /[[\]{}\s"<>^`|\\?#]|[^ -~]/);
  });
}

void test("empty segments go away", () => {
  assert.equal(encodedPath("/library//7/a.mp3"), "library/7/a.mp3");
});
