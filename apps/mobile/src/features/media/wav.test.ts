/** WAV exports and import. */
import assert from "node:assert/strict";
import { test } from "node:test";

import { bytesSource } from "./byte-source.ts";
import {
  concatBytes,
  latin1Bytes,
  latin1Text,
  readUint32LE,
  uint32LE,
} from "./bytes.ts";
import {
  applied,
  assertWritten,
  endsWith,
  frame23,
  frameBytes,
  id3,
  latin1,
  LYRICS,
  readBack,
  TAGS,
  WAV,
} from "./retag-testing.ts";
import { planRetag } from "./retag.ts";

function chunk(id: string, body: Uint8Array) {
  return concatBytes([
    latin1Bytes(id),
    uint32LE(body.length),
    body,
    new Uint8Array(body.length % 2),
  ]);
}

function riff(...chunks: Uint8Array[]) {
  const body = concatBytes([latin1Bytes("WAVE"), ...chunks]);
  return concatBytes([latin1Bytes("RIFF"), uint32LE(body.length), body]);
}

const FMT = chunk(
  "fmt ",
  Uint8Array.of(1, 0, 1, 0, 0x40, 0x1f, 0, 0, 0x40, 0x1f, 0, 0, 1, 0, 8, 0),
);
const SAMPLES = chunk("data", new Uint8Array(51).fill(0x80));

function wavChunks(bytes: Uint8Array) {
  assert.equal(
    readUint32LE(bytes, 4),
    bytes.length - 8,
    "the RIFF size is right",
  );
  const found = new Array<{ id: string; body: Uint8Array }>();
  let offset = 12;
  while (offset < bytes.length) {
    const size = readUint32LE(bytes, offset + 4);
    found.push({
      body: bytes.subarray(offset + 8, offset + 8 + size),
      id: latin1Text(bytes.subarray(offset, offset + 4)),
    });
    offset += 8 + size + (size % 2);
  }
  assert.equal(offset, bytes.length);
  return found;
}

void test("a real WAV gets tags ahead of its audio, in both of its formats", () => {
  const copy = applied(WAV, "a.wav");
  assertWritten(copy, "a.wav");
  const before = wavChunks(WAV);
  const after = wavChunks(copy);
  assert.deepEqual(
    after.find((found) => found.id === "data")?.body,
    before.find((found) => found.id === "data")?.body,
  );
  const names = after.map((found) => found.id);
  assert.ok(names.indexOf("fmt ") < names.indexOf("data"));
  assert.ok(names.includes("LIST"));
  assert.ok(names.includes("id3 "));
});

void test("WAV INFO fields are read, and its other fields kept", () => {
  const info = concatBytes([
    latin1Bytes("INFO"),
    chunk("INAM", latin1Bytes("Old Title\0")),
    chunk("IART", latin1Bytes("Old Artist\0")),
    chunk("IPRD", latin1Bytes("Old Album\0")),
    chunk("ICRD", latin1Bytes("2001\0")),
    chunk("ISFT", latin1Bytes("Some Tool\0")),
  ]);
  const before = riff(FMT, chunk("LIST", info), SAMPLES);
  const { tags } = readBack(before, "a.wav");
  assert.equal(tags.title, "Old Title");
  assert.equal(tags.artist, "Old Artist");
  assert.equal(tags.album, "Old Album");
  const copy = applied(before, "a.wav");
  const list = wavChunks(copy).filter((found) => found.id === "LIST");
  assert.equal(list.length, 1);
  assert.ok(
    latin1Text(list[0]?.body ?? new Uint8Array()).includes("Some Tool"),
  );
  assert.ok(
    !latin1Text(list[0]?.body ?? new Uint8Array()).includes("Old Title"),
  );
  endsWith(copy, SAMPLES);
});

void test("WAV: tag chunks after the audio become JUNK, and other chunks stay", () => {
  const cue = chunk("cue ", uint32LE(0));
  const oldId3 = id3(
    3,
    0,
    frame23("TIT2", latin1("Old")),
    frame23("USLT", LYRICS),
  );
  const before = riff(
    FMT,
    SAMPLES,
    chunk(
      "LIST",
      concatBytes([latin1Bytes("INFO"), chunk("INAM", latin1Bytes("Old\0"))]),
    ),
    chunk("id3 ", oldId3),
    cue,
  );
  const copy = applied(before, "a.wav");
  assertWritten(copy, "a.wav");
  const found = wavChunks(copy);
  assert.deepEqual(
    found.map((entry) => entry.id),
    ["fmt ", "LIST", "id3 ", "data", "JUNK", "JUNK", "cue "],
  );
  // The file's own frames carried over, though their chunk is now JUNK.
  const id3Chunk = found.find((entry) => entry.id === "id3 ");
  assert.deepEqual(
    frameBytes(id3Chunk?.body ?? new Uint8Array(), "USLT")?.subarray(10),
    LYRICS,
  );
  assert.deepEqual(found.find((entry) => entry.id === "data")?.body.length, 51);
});

void test("a WAV whose sizes don't add up isn't tagged", () => {
  const lying = riff(FMT, SAMPLES);
  lying.set(uint32LE(0xffffffff), 12 + FMT.length + 4);
  assert.equal(planRetag(bytesSource(lying), "a.wav", TAGS), null);
  assert.equal(planRetag(bytesSource(riff(FMT)), "a.wav", TAGS), null);
});
