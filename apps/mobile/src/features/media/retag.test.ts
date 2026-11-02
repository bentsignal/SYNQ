/** Choosing a format by bytes, AAC, and damaged files. */
import assert from "node:assert/strict";
import { test } from "node:test";

import { bytesSource } from "./byte-source.ts";
import { concatBytes, latin1Bytes } from "./bytes.ts";
import { FLAC_BLOCK } from "./flac.ts";
import {
  AAC,
  applied,
  assertWritten,
  endsWith,
  FLAC,
  flacWith,
  frame23,
  id3,
  latin1,
  M4A,
  MP3,
  readBack,
  TAGS,
  vorbisBody,
  WAV,
} from "./retag-testing.ts";
import { planRetag, readEmbeddedTags, sniffAudio } from "./retag.ts";

void test("an AAC stream gets an ID3 tag ahead of it, audio untouched", () => {
  const copy = applied(AAC, "a.aac");
  assertWritten(copy, "a.aac");
  endsWith(copy, AAC);
  assert.equal(planRetag(bytesSource(AAC), "a.aac", TAGS)?.format, "adts");
  const again = applied(copy, "a.aac", { ...TAGS, title: "Again" });
  assert.equal(readBack(again, "a.aac").tags.title, "Again");
  endsWith(again, AAC);
});

void test("the bytes say what a file is, whatever it's called", () => {
  function sniff(bytes: Uint8Array, name = "x.bin") {
    return sniffAudio(bytesSource(bytes), name);
  }
  assert.equal(sniff(MP3), "mp3");
  assert.equal(sniff(AAC), "adts");
  assert.equal(sniff(FLAC), "flac");
  assert.equal(sniff(WAV), "wav");
  assert.equal(sniff(M4A), "mp4");
  assert.equal(sniff(latin1Bytes("OggS and so on....")), null);
  assert.equal(sniff(latin1Bytes("FORM....AIFF and so")), null);
  assert.equal(sniff(new Uint8Array(4000)), null);
  assert.equal(
    sniff(new Uint8Array(4000), "x.mp3"),
    "mp3",
    "junk ahead of frames",
  );
  assert.equal(sniff(new Uint8Array(0), "x.mp3"), null);
});

void test("a file misnamed for its contents is shared as it is, never given the wrong tag", () => {
  for (const [bytes, name] of [
    [M4A, "misnamed.mp3"],
    [FLAC, "misnamed.mp3"],
    [WAV, "misnamed.mp3"],
    [MP3, "misnamed.m4a"],
    [MP3, "misnamed.flac"],
    [latin1Bytes("OggS and so on...."), "misnamed.mp3"],
  ] as const) {
    assert.equal(planRetag(bytesSource(bytes), name, TAGS), null, name);
  }
  // Reading is harmless: the tags of a misnamed FLAC still count.
  assert.ok(
    readEmbeddedTags(
      bytesSource(
        flacWith({
          body: vorbisBody(["TITLE=T"]),
          type: FLAC_BLOCK.vorbisComment,
        }),
      ),
      "misnamed.mp3",
    ),
  );
});

void test("unknown extensions follow the bytes", () => {
  assert.equal(planRetag(bytesSource(M4A), "a.mp4", TAGS)?.format, "mp4");
  assert.equal(planRetag(bytesSource(M4A), "a.aac", TAGS)?.format, "mp4");
  assert.equal(planRetag(bytesSource(MP3), "a.mpeg", TAGS)?.format, "mp3");
});

void test("truncated and damaged files never hang", () => {
  const files = [
    [concatBytes([id3(3, 0, frame23("TIT2", latin1("Old"))), MP3]), "a.mp3"],
    [FLAC, "a.flac"],
    [M4A, "a.m4a"],
    [WAV, "a.wav"],
    [AAC, "a.aac"],
  ] as const;
  let seed = 7;
  function random(limit: number) {
    seed = (seed * 1103515245 + 12345) % 0x80000000;
    return seed % limit;
  }
  for (const [bytes, name] of files) {
    const step = Math.max(1, Math.floor(bytes.length / 200));
    const damaged = [
      ...Array.from({ length: 200 }, (_, index) =>
        bytes.subarray(0, Math.min(bytes.length, index * step)),
      ),
      ...Array.from({ length: 200 }, () => {
        const copy = bytes.slice();
        const head = Math.min(copy.length, 2048);
        for (let flip = 0; flip < 8; flip++) copy[random(head)] = random(256);
        return copy;
      }),
    ];
    for (const file of damaged) {
      // A throw is fine: the app reads that as "no tags", or shares the file as
      // it is. A hang would fail this test by timing out.
      try {
        readEmbeddedTags(bytesSource(file), name);
        planRetag(bytesSource(file), name, TAGS);
      } catch {
        continue;
      }
    }
  }
});
