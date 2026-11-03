/**
 * Shared by the tag tests: small real files (`fixtures/`, made with ffmpeg),
 * tags assembled by hand, and doing what an export does with a plan. The audio
 * must come out byte for byte, and the tags must read back. `scripts/audio-tags`
 * runs a bigger corpus through other tools; docs/audio-tags.md says what's
 * covered where.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import type { SongTags } from "./song-tags.ts";
import { bytesSource } from "./byte-source.ts";
import {
  concatBytes,
  latin1Bytes,
  uint32BE,
  uint32LE,
  utf8Bytes,
} from "./bytes.ts";
import { FLAC_BLOCK } from "./flac.ts";
import { id3TagLength, parseId3Frames } from "./id3.ts";
import { planRetag, readEmbeddedTags, readFlacBlocks } from "./retag.ts";

export function fixture(name: string) {
  return new Uint8Array(
    readFileSync(new URL(`./fixtures/${name}`, import.meta.url)),
  );
}

export const MP3 = fixture("tone.mp3");
export const FLAC = fixture("tone.flac");
export const WAV = fixture("tone.wav");
export const AAC = fixture("tone.aac");
export const M4A = fixture("tone-tagged.m4a");
export const M4A_FASTSTART = fixture("tone-faststart.m4a");

export const COVER = Uint8Array.of(
  0xff,
  0xd8,
  0xff,
  0xe0,
  1,
  2,
  3,
  4,
  0xff,
  0xd9,
);

export const TAGS = {
  album: "Romance ✨",
  albumArtists: ["Various Artists"],
  artists: ["Shawn Mendes", "Camila Cabello"],
  artwork: COVER,
  title: "Señorita 🎵 東京 مرحبا",
  track: 3,
  year: 2021,
} satisfies SongTags;

/** Does what an export does with a plan: head, the source from skip, patches. */
export function applied(
  before: Uint8Array,
  name: string,
  tags: SongTags = TAGS,
) {
  const plan = planRetag(bytesSource(before), name, tags);
  assert.ok(plan, `${name} should be taggable`);
  const end = plan.patches.reduce(
    (top, patch) => Math.max(top, patch.offset + patch.bytes.length),
    plan.head.length + before.length - plan.skip,
  );
  const copy = new Uint8Array(end);
  copy.set(plan.head);
  copy.set(before.subarray(plan.skip), plan.head.length);
  for (const patch of plan.patches) copy.set(patch.bytes, patch.offset);
  return copy;
}

export function readBack(bytes: Uint8Array, name: string) {
  const read = readEmbeddedTags(bytesSource(bytes), name);
  assert.ok(read, `${name} should have tags`);
  return read;
}

export function assertWritten(bytes: Uint8Array, name: string) {
  const { artwork, tags } = readBack(bytes, name);
  assert.equal(tags.title, TAGS.title);
  assert.equal(tags.artist, "Shawn Mendes, Camila Cabello");
  assert.equal(tags.albumArtist, "Various Artists");
  assert.equal(tags.album, TAGS.album);
  assert.equal(Number.parseInt(tags.year ?? "", 10), 2021);
  assert.equal(Number.parseInt(tags.track ?? "", 10), 3);
  assert.deepEqual([...(artwork ?? [])], [...COVER]);
}

export function endsWith(bytes: Uint8Array, tail: Uint8Array) {
  const start = bytes.length - tail.length;
  assert.ok(start >= 0);
  assert.ok(
    bytes.subarray(start).every((byte, index) => byte === tail[index]),
    "the audio changed",
  );
}

// ---- Assembling ID3 by hand ------------------------------------------------

export function syncsafeBytes(value: number) {
  return Uint8Array.of(
    (value >>> 21) & 0x7f,
    (value >>> 14) & 0x7f,
    (value >>> 7) & 0x7f,
    value & 0x7f,
  );
}

export function frame23(id: string, body: Uint8Array) {
  return concatBytes([
    latin1Bytes(id),
    uint32BE(body.length),
    Uint8Array.of(0, 0),
    body,
  ]);
}

export function frame24(id: string, body: Uint8Array, flags = 0) {
  return concatBytes([
    latin1Bytes(id),
    syncsafeBytes(body.length),
    Uint8Array.of(0, flags),
    body,
  ]);
}

export function frame22(id: string, body: Uint8Array) {
  return concatBytes([
    latin1Bytes(id),
    Uint8Array.of(
      body.length >> 16,
      (body.length >> 8) & 0xff,
      body.length & 0xff,
    ),
    body,
  ]);
}

export function id3(version: number, flags: number, ...bodies: Uint8Array[]) {
  const body = concatBytes(bodies);
  return concatBytes([
    latin1Bytes("ID3"),
    Uint8Array.of(version, 0, flags),
    syncsafeBytes(body.length),
    body,
  ]);
}

export function latin1(text: string) {
  return concatBytes([Uint8Array.of(0), latin1Bytes(text)]);
}

export function utf8(text: string) {
  return concatBytes([Uint8Array.of(3), utf8Bytes(text)]);
}

export const LYRICS = concatBytes([
  Uint8Array.of(0),
  latin1Bytes("eng\0Words"),
]);

export function apic(type: number, data: number, description = "") {
  return concatBytes([
    Uint8Array.of(0),
    latin1Bytes("image/jpeg\0"),
    Uint8Array.of(type),
    latin1Bytes(`${description}\0`),
    Uint8Array.of(data, data),
  ]);
}

export function ids(tag: Uint8Array) {
  return parseId3Frames(tag)?.frames.map((frame) => frame.id);
}

export function headOf(bytes: Uint8Array) {
  return bytes.subarray(0, id3TagLength(bytes.subarray(0, 10)));
}

/** The body of the first frame with this id in the tag at the start of `bytes`. */
export function frameBytes(bytes: Uint8Array, id: string) {
  return parseId3Frames(headOf(bytes))?.frames.find((frame) => frame.id === id)
    ?.bytes;
}

export function vorbisBody(fields: readonly (string | Uint8Array)[]) {
  const vendor = utf8Bytes("reference libFLAC");
  const encoded = fields.map((field) =>
    typeof field === "string" ? utf8Bytes(field) : field,
  );
  return concatBytes([
    uint32LE(vendor.length),
    vendor,
    uint32LE(encoded.length),
    ...encoded.flatMap((field) => [uint32LE(field.length), field]),
  ]);
}

/** The fixture's audio, under new blocks. */
export function flacWith(
  ...blocks: readonly { type: number; body: Uint8Array }[]
) {
  const read = readFlacBlocks(bytesSource(FLAC));
  assert.ok(read);
  const streamInfo = read.blocks.find(
    (block) => block.type === FLAC_BLOCK.streamInfo,
  );
  assert.ok(streamInfo);
  const all = [streamInfo, ...blocks];
  return concatBytes([
    latin1Bytes("fLaC"),
    ...all.map((block, index) =>
      concatBytes([
        Uint8Array.of(
          block.type | (index === all.length - 1 ? 0x80 : 0),
          block.body.length >> 16,
          (block.body.length >> 8) & 0xff,
          block.body.length & 0xff,
        ),
        block.body,
      ]),
    ),
    FLAC.subarray(read.end),
  ]);
}
