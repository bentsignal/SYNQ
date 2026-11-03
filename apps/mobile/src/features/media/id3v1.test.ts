/** ID3v1, which an export rewrites rather than leaves saying the old values. */
import assert from "node:assert/strict";
import { test } from "node:test";

import { concatBytes, latin1Bytes, latin1Text } from "./bytes.ts";
import { updateId3v1 } from "./id3v1.ts";
import { applied, MP3, TAGS } from "./retag-testing.ts";

function id3v1() {
  const tail = new Uint8Array(128);
  tail.set(latin1Bytes("TAG"));
  tail.set(latin1Bytes("V1 Title"), 3);
  tail.set(latin1Bytes("V1 Artist"), 33);
  tail.set(latin1Bytes("V1 Album"), 63);
  tail.set(latin1Bytes("2001"), 93);
  tail.set(latin1Bytes("v1 comment"), 97);
  tail[126] = 7;
  tail[127] = 17;
  return tail;
}

void test("an ID3v1 tag at the end is rewritten, never left saying the old values", () => {
  const before = concatBytes([MP3, id3v1()]);
  const copy = applied(before, "a.mp3");
  assert.equal(copy.length, applied(MP3, "a.mp3").length + 128);
  const tail = copy.subarray(copy.length - 128);
  assert.equal(latin1Text(tail.subarray(0, 3)), "TAG");
  assert.equal(latin1Text(tail.subarray(3, 11)), "Señorita");
  assert.equal(latin1Text(tail.subarray(33, 45)), "Shawn Mendes");
  assert.equal(latin1Text(tail.subarray(93, 97)), "2021");
  assert.equal(
    latin1Text(tail.subarray(97, 107)),
    "v1 comment",
    "keeps its comment",
  );
  assert.equal(tail[126], 3);
  assert.equal(tail[127], 17, "keeps its genre");
  const audio = applied(MP3, "a.mp3");
  assert.deepEqual(copy.subarray(audio.length - MP3.length, audio.length), MP3);
});

void test("ID3v1 fields fit, and text it can't hold is left out", () => {
  const tail = updateId3v1(id3v1(), {
    ...TAGS,
    album: null,
    title: `東京 ${"x".repeat(40)}`,
    track: 300,
    year: null,
  });
  assert.equal(latin1Text(tail.subarray(3, 33)), ` ${"x".repeat(29)}`);
  assert.ok(tail.subarray(63, 93).every((byte) => byte === 0));
  assert.equal(tail[126], 0, "a track past 255 doesn't fit");
});
