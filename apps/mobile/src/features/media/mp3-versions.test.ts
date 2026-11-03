/** MP3 exports across ID3 versions and tag shapes: audio untouched, frames kept. */
import assert from "node:assert/strict";
import { test } from "node:test";

import { concatBytes, latin1Bytes, uint32BE } from "./bytes.ts";
import { id3TagLength, readId3Tags } from "./id3.ts";
import {
  applied,
  assertWritten,
  COVER,
  endsWith,
  frame22,
  frame23,
  frame24,
  frameBytes,
  id3,
  ids,
  latin1,
  LYRICS,
  MP3,
  readBack,
  syncsafeBytes,
  utf8,
} from "./retag-testing.ts";

void test("MP3 without a tag: a new one, the audio untouched", () => {
  const copy = applied(MP3, "a.mp3");
  assertWritten(copy, "a.mp3");
  endsWith(copy, MP3);
  assert.equal(copy[3], 3, "a new tag is ID3v2.3");
});

void test("MP3 with 2.3: its other frames survive byte for byte, audio untouched", () => {
  const genre = frame23("TCON", latin1("Jazz"));
  const lyrics = frame23("USLT", LYRICS);
  const gain = frame23("TXXX", latin1("replaygain_track_gain\0-3.21 dB"));
  const comment = frame23("COMM", LYRICS);
  const before = concatBytes([
    id3(
      3,
      0,
      frame23("TIT2", latin1("Old")),
      frame23("TPE2", latin1("Old Album Artist")),
      genre,
      lyrics,
      gain,
      comment,
      new Uint8Array(100),
    ),
    MP3,
  ]);
  const copy = applied(before, "a.mp3");
  assertWritten(copy, "a.mp3");
  endsWith(copy, MP3);
  for (const [id, expected] of [
    ["TCON", genre],
    ["USLT", lyrics],
    ["TXXX", gain],
    ["COMM", comment],
  ] as const) {
    assert.deepEqual(frameBytes(copy, id), expected, id);
  }
});

void test("ID3v2.2 is read (AVFoundation skips it) and upgraded, keeping its frames", () => {
  const pic = concatBytes([
    Uint8Array.of(0),
    latin1Bytes("JPG"),
    Uint8Array.of(3, 0),
    COVER,
  ]);
  const tag = id3(
    2,
    0,
    frame22("TT2", latin1("Old Title")),
    frame22("TP1", latin1("Old Artist")),
    frame22("TP2", latin1("Album Artist")),
    frame22("TAL", latin1("Old Album")),
    frame22("TRK", latin1("3/12")),
    frame22("TYE", latin1("2019")),
    frame22("TCP", latin1("1")),
    frame22("ULT", LYRICS),
    frame22("PIC", pic),
    new Uint8Array(20),
  );
  assert.deepEqual(readId3Tags(tag), {
    artwork: readId3Tags(tag)?.artwork,
    tags: {
      album: "Old Album",
      albumArtist: "Album Artist",
      artist: "Old Artist",
      compilation: true,
      title: "Old Title",
      track: "3/12",
      year: "2019",
    },
  });
  assert.deepEqual([...(readId3Tags(tag)?.artwork ?? [])], [...COVER]);
  const copy = applied(concatBytes([tag, MP3]), "a.mp3");
  assert.equal(copy[3], 3);
  assertWritten(copy, "a.mp3");
  endsWith(copy, MP3);
  assert.deepEqual(frameBytes(copy, "USLT")?.subarray(10), LYRICS);
  assert.ok(frameBytes(copy, "TCMP"));
});

void test("whole-tag unsynchronisation in 2.3 is decoded, not thrown away", () => {
  const body = concatBytes([
    frame23("TIT2", latin1("Old")),
    frame23("USLT", concatBytes([LYRICS, Uint8Array.of(0xff, 0xe0, 0xff)])),
  ]);
  const unsynced = new Array<number>();
  body.forEach((byte, index) => {
    unsynced.push(byte);
    const next = body[index + 1] ?? 0;
    if (byte === 0xff && (next >= 0xe0 || next === 0)) unsynced.push(0);
  });
  const before = concatBytes([id3(3, 0x80, Uint8Array.from(unsynced)), MP3]);
  const copy = applied(before, "a.mp3");
  assert.equal(copy[5], 0, "the new tag isn't unsynchronised");
  endsWith(copy, MP3);
  assert.deepEqual(
    frameBytes(copy, "USLT")?.subarray(10),
    concatBytes([LYRICS, Uint8Array.of(0xff, 0xe0, 0xff)]),
  );
  assert.equal(readBack(before, "a.mp3").tags.title, "Old");
});

void test("whole-tag unsynchronisation in 2.4 stays on each frame", () => {
  const before = concatBytes([
    id3(4, 0x80, frame24("TIT2", utf8("Old")), frame24("USLT", LYRICS)),
    MP3,
  ]);
  const copy = applied(before, "a.mp3");
  assert.equal(copy[3], 4);
  assert.equal(copy[5], 0);
  assert.equal(
    frameBytes(copy, "USLT")?.[9],
    0x02,
    "the frame says so instead",
  );
  endsWith(copy, MP3);
});

void test("extended headers are skipped, which AVFoundation doesn't do", () => {
  const ext23 = concatBytes([uint32BE(6), new Uint8Array(6)]);
  const v23 = id3(3, 0x40, ext23, frame23("TIT2", latin1("Three")));
  assert.equal(readId3Tags(v23)?.tags.title, "Three");
  const ext24 = concatBytes([syncsafeBytes(6), Uint8Array.of(1, 0)]);
  const v24 = id3(4, 0x40, ext24, frame24("TIT2", utf8("Four")));
  assert.equal(readId3Tags(v24)?.tags.title, "Four");
  for (const tag of [v23, v24]) {
    const copy = applied(concatBytes([tag, MP3]), "a.mp3");
    assert.equal(copy[5], 0, "the new tag has no extended header");
    assertWritten(copy, "a.mp3");
    endsWith(copy, MP3);
  }
});

void test("a 2.4 footer counts in the tag's length", () => {
  const body = frame24("TIT2", utf8("Old"));
  const tag = concatBytes([
    latin1Bytes("ID3"),
    Uint8Array.of(4, 0, 0x10),
    syncsafeBytes(body.length),
    body,
    latin1Bytes("3DI"),
    Uint8Array.of(4, 0, 0x10),
    syncsafeBytes(body.length),
  ]);
  assert.equal(id3TagLength(tag), tag.length);
  endsWith(applied(concatBytes([tag, MP3]), "a.mp3"), MP3);
});

void test("iTunes' plain 2.4 frame sizes are understood, and written properly", () => {
  function long(id: string, fill: number, length: number) {
    return concatBytes([
      latin1Bytes(id),
      uint32BE(length + 5),
      Uint8Array.of(0, 0),
      Uint8Array.of(0),
      latin1Bytes("eng\0"),
      new Uint8Array(length).fill(fill),
    ]);
  }
  const before = concatBytes([
    id3(
      4,
      0,
      frame24("TIT2", utf8("Old")),
      long("USLT", 0x4c, 300),
      long("COMM", 0x43, 200),
    ),
    MP3,
  ]);
  const copy = applied(before, "a.mp3");
  endsWith(copy, MP3);
  const lyrics = frameBytes(copy, "USLT");
  assert.ok(lyrics);
  assert.equal(lyrics.length, 10 + 305);
  assert.deepEqual([...lyrics.subarray(4, 8)], [...syncsafeBytes(305)]);
  assert.equal(frameBytes(copy, "COMM")?.length, 10 + 205);
});

void test("a frame with nothing in it doesn't end the tag", () => {
  const before = id3(
    3,
    0,
    frame23("TIT2", latin1("Old")),
    frame23("TCOM", new Uint8Array(0)),
    frame23("USLT", LYRICS),
  );
  assert.deepEqual(ids(before), ["TIT2", "USLT"]);
});

void test("\"ID3\" that isn't a tag isn't treated as one", () => {
  assert.equal(id3TagLength(latin1Bytes("ID3\xff\xff\xff\xff\xff\xff\xff")), 0);
  assert.equal(
    id3TagLength(Uint8Array.of(0x49, 0x44, 0x33, 3, 0, 0, 0x80, 0, 0, 0)),
    0,
  );
  assert.equal(
    id3TagLength(Uint8Array.of(0x49, 0x44, 0x33, 9, 0, 0, 0, 0, 0, 10)),
    0,
  );
  assert.equal(
    id3TagLength(Uint8Array.of(0xff, 0xfb, 0x90, 0, 0, 0, 0, 0, 0, 0)),
    0,
  );
  const before = concatBytes([
    latin1Bytes("ID3\xff\xff\xff\xff\xff\xff\xff"),
    MP3,
  ]);
  endsWith(applied(before, "a.mp3"), before);
});
