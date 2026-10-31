import assert from "node:assert/strict";
import { test } from "node:test";

import type { SongTags } from "./song-tags.ts";
import {
  concatBytes,
  latin1Bytes,
  latin1Text,
  uint32BE,
  utf8Bytes,
  utf8Text,
} from "./bytes.ts";
import {
  buildFlacHead,
  FLAC_BLOCK,
  parseFlacBlockHeader,
  parsePicture,
  parseVorbisComment,
  readFlacTags,
} from "./flac.ts";
import { buildId3Tag, id3TagLength, parseId3Frames } from "./id3.ts";
import { jpegSize } from "./jpeg.ts";

/** A minimal JPEG: SOI, an APP0 segment, then SOF0 for 640×480. */
const JPEG = Uint8Array.of(
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11, 0x08,
  0x01, 0xe0, 0x02, 0x80, 0x03, 0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11,
  0x01, 0xff, 0xd9,
);

const TAGS: SongTags = {
  title: "Señorita 🎵",
  artists: ["Shawn Mendes", "Camila Cabello"],
  album: "Romance",
  year: 2019,
  track: 3,
  artwork: JPEG,
};

void test("UTF-8 survives a round trip, including astral characters", () => {
  const text = "Beyoncé — 東京 🎶";
  assert.equal(utf8Text(utf8Bytes(text)), text);
});

void test("reads a JPEG's size from its frame header", () => {
  assert.deepEqual(jpegSize(JPEG), { width: 640, height: 480 });
  assert.equal(jpegSize(Uint8Array.of(1, 2, 3)), null);
});

/** An ID3v2.3 tag with the given frames (id, body) and some padding. */
function id3v23(frames: [string, Uint8Array][]) {
  const encoded = concatBytes(
    frames.map(([id, body]) =>
      concatBytes([latin1Bytes(id), uint32BE(body.length), Uint8Array.of(0, 0), body]),
    ),
  );
  const size = encoded.length + 20;
  return concatBytes([
    latin1Bytes("ID3"),
    Uint8Array.of(3, 0, 0),
    Uint8Array.of(
      (size >> 21) & 0x7f,
      (size >> 14) & 0x7f,
      (size >> 7) & 0x7f,
      size & 0x7f,
    ),
    encoded,
    new Uint8Array(20),
  ]);
}

function textFrame(id: string, text: string): [string, Uint8Array] {
  return [id, concatBytes([Uint8Array.of(0), latin1Bytes(text)])];
}

void test("sizes an ID3 tag from its header, and finds none in plain audio", () => {
  const tag = id3v23([textFrame("TIT2", "Old")]);
  assert.equal(id3TagLength(tag), tag.length);
  assert.equal(id3TagLength(Uint8Array.of(0xff, 0xfb, 0x90, 0, 0, 0, 0, 0, 0, 0)), 0);
});

void test("an MP3 export replaces SYNQ's frames and keeps the others", () => {
  const existing = id3v23([
    textFrame("TIT2", "Old Title"),
    textFrame("TPE1", "Old Artist"),
    textFrame("TCON", "Pop"),
    textFrame("TYER", "1999"),
    ["APIC", Uint8Array.of(0, 0x69, 0, 0, 0, 1, 2, 3)],
    textFrame("COMM", "keep me"),
  ]);
  const tag = buildId3Tag(TAGS, existing);
  assert.equal(id3TagLength(tag), tag.length);
  const parsed = parseId3Frames(tag);
  assert.ok(parsed);
  assert.equal(parsed.version, 3);
  const ids = parsed.frames.map((frame) => frame.id);
  assert.deepEqual(ids, ["TIT2", "TPE1", "TALB", "TYER", "TRCK", "APIC", "TCON", "COMM"]);
  // Kept frames are byte for byte what they were.
  const genre = parsed.frames.find((frame) => frame.id === "TCON");
  assert.equal(latin1Text(genre?.bytes.subarray(11) ?? new Uint8Array()), "Pop");
  // The new title is UTF-16 with a byte order mark (2.3).
  const title = parsed.frames[0]?.bytes ?? new Uint8Array();
  assert.equal(title[10], 1);
  assert.deepEqual([...title.subarray(11, 13)], [0xff, 0xfe]);
});

void test("an MP3 export keeps the file's artwork when SYNQ has none", () => {
  const existing = id3v23([["APIC", Uint8Array.of(0, 0x69, 0, 0, 0, 9)]]);
  const parsed = parseId3Frames(buildId3Tag({ ...TAGS, artwork: null }, existing));
  assert.deepEqual(
    parsed?.frames.map((frame) => frame.id),
    ["TIT2", "TPE1", "TALB", "TYER", "TRCK", "APIC"],
  );
});

void test("an MP3 without a tag gets a fresh ID3v2.3 one", () => {
  const parsed = parseId3Frames(buildId3Tag(TAGS, null));
  assert.equal(parsed?.version, 3);
  assert.equal(parsed?.frames.length, 6);
});

/** A FLAC head: STREAMINFO, a Vorbis comment, a picture, and padding. */
function flacBlocks() {
  const vendor = utf8Bytes("reference libFLAC 1.4.3");
  const comments = ["TITLE=Old", "artist=A", "ARTIST=B", "GENRE=Jazz", "TRACKNUMBER=07"].map(utf8Bytes);
  const le = (value: number) =>
    Uint8Array.of(value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, value >>> 24);
  const comment = concatBytes([
    le(vendor.length),
    vendor,
    le(comments.length),
    ...comments.flatMap((field) => [le(field.length), field]),
  ]);
  const mime = latin1Bytes("image/png");
  const picture = concatBytes([
    uint32BE(3),
    uint32BE(mime.length),
    mime,
    uint32BE(0),
    new Uint8Array(16),
    uint32BE(3),
    Uint8Array.of(7, 8, 9),
  ]);
  return [
    { type: FLAC_BLOCK.streamInfo, body: new Uint8Array(34).fill(5) },
    { type: FLAC_BLOCK.vorbisComment, body: comment },
    { type: FLAC_BLOCK.picture, body: picture },
    { type: FLAC_BLOCK.padding, body: new Uint8Array(100) },
  ];
}

/** Splits a built head back into blocks. */
function blocksOf(head: Uint8Array) {
  assert.equal(latin1Text(head.subarray(0, 4)), "fLaC");
  const blocks = [];
  let offset = 4;
  for (;;) {
    const header = parseFlacBlockHeader(head.subarray(offset, offset + 4));
    blocks.push({ type: header.type, body: head.subarray(offset + 4, offset + 4 + header.length) });
    offset += 4 + header.length;
    if (header.last) break;
  }
  assert.equal(offset, head.length);
  return blocks;
}

void test("reads FLAC tags at import: several ARTIST fields, the front cover", () => {
  const { tags, artwork } = readFlacTags(flacBlocks());
  assert.deepEqual(tags, {
    title: "Old",
    artist: "A, B",
    album: null,
    year: null,
    track: "07",
  });
  assert.deepEqual([...(artwork ?? [])], [7, 8, 9]);
});

void test("a FLAC export rewrites the comments and cover, keeping the rest", () => {
  const blocks = blocksOf(buildFlacHead(flacBlocks(), TAGS));
  assert.deepEqual(
    blocks.map((block) => block.type),
    [FLAC_BLOCK.streamInfo, FLAC_BLOCK.vorbisComment, FLAC_BLOCK.picture, FLAC_BLOCK.padding],
  );
  assert.deepEqual([...(blocks[0]?.body ?? [])], new Array(34).fill(5));
  const comment = parseVorbisComment(blocks[1]?.body ?? new Uint8Array());
  assert.equal(utf8Text(comment.vendor), "reference libFLAC 1.4.3");
  assert.deepEqual(comment.fields, [
    "TITLE=Señorita 🎵",
    "ARTIST=Shawn Mendes, Camila Cabello",
    "ALBUM=Romance",
    "DATE=2019",
    "TRACKNUMBER=3",
    "GENRE=Jazz",
  ]);
  const picture = parsePicture(blocks[2]?.body ?? new Uint8Array());
  assert.equal(picture.type, 3);
  assert.equal(picture.mimeType, "image/jpeg");
  assert.deepEqual([...picture.data], [...JPEG]);
  // Reading the export gives back what was written.
  assert.deepEqual(readFlacTags(blocks).tags, {
    title: "Señorita 🎵",
    artist: "Shawn Mendes, Camila Cabello",
    album: "Romance",
    year: "2019",
    track: "3",
  });
});

void test("a FLAC export keeps the file's cover when SYNQ has none", () => {
  const blocks = blocksOf(buildFlacHead(flacBlocks(), { ...TAGS, artwork: null }));
  const picture = blocks.find((block) => block.type === FLAC_BLOCK.picture);
  assert.deepEqual([...parsePicture(picture?.body ?? new Uint8Array()).data], [7, 8, 9]);
});
