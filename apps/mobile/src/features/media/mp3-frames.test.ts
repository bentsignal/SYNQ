/** MP3 exports: odd tags, pictures, what's kept, and text encodings. */
import assert from "node:assert/strict";
import { test } from "node:test";

import { concatBytes, latin1Bytes, latin1Text, uint32BE } from "./bytes.ts";
import { parseId3Frames, readId3Tags } from "./id3.ts";
import {
  apic,
  applied,
  COVER,
  endsWith,
  frame23,
  frame24,
  frameBytes,
  headOf,
  id3,
  ids,
  latin1,
  MP3,
  readBack,
  syncsafeBytes,
  TAGS,
  utf8,
} from "./retag-testing.ts";

void test("a tag claiming to be bigger than the file leaves the audio alone", () => {
  const claims = concatBytes([
    latin1Bytes("ID3"),
    Uint8Array.of(3, 0, 0),
    syncsafeBytes(0x0fffffff),
    MP3,
  ]);
  endsWith(applied(claims, "a.mp3"), claims);
});

void test("junk ahead of the first frame, and false syncs in a tag, stay put", () => {
  const junk = concatBytes([Uint8Array.of(0xff, 0xfb, 0, 0, 1, 2, 3), MP3]);
  const tagged = concatBytes([
    id3(3, 0, frame23("PRIV", new Uint8Array(64).fill(0xff))),
    junk,
  ]);
  const copy = applied(tagged, "a.mp3");
  endsWith(copy, junk);
  assert.equal(frameBytes(copy, "PRIV")?.length, 10 + 64);
});

void test("a tag bigger than the audio", () => {
  const before = concatBytes([
    id3(
      3,
      0,
      frame23("APIC", apic(3, 7)),
      frame23("PRIV", new Uint8Array(MP3.length * 4)),
    ),
    MP3,
  ]);
  const copy = applied(before, "a.mp3");
  endsWith(copy, MP3);
  assert.ok(frameBytes(copy, "PRIV"));
});

void test("several pictures: the front cover at import, and export keeps the back", () => {
  const tag = id3(
    3,
    0,
    frame23("APIC", apic(4, 4, "back")),
    frame23("APIC", apic(3, 3, "front")),
    frame23("APIC", apic(0, 9, "other")),
  );
  assert.deepEqual([...(readId3Tags(tag)?.artwork ?? [])], [3, 3]);
  const copy = applied(concatBytes([tag, MP3]), "a.mp3");
  const pictures = parseId3Frames(headOf(copy))?.frames.filter(
    (frame) => frame.id === "APIC",
  );
  assert.ok(pictures);
  assert.equal(pictures.length, 2, "front and other are replaced, back stays");
  assert.deepEqual([...(readBack(copy, "a.mp3").artwork ?? [])], [...COVER]);
  assert.deepEqual(pictures[1]?.bytes.subarray(10), apic(4, 4, "back"));
});

void test("a new cover's description never clashes with a kept picture's", () => {
  const tag = id3(3, 0, frame23("APIC", apic(4, 4, "")));
  const copy = applied(concatBytes([tag, MP3]), "a.mp3");
  const [cover] =
    parseId3Frames(headOf(copy))?.frames.filter(
      (frame) => frame.id === "APIC",
    ) ?? [];
  assert.ok(
    latin1Text(cover?.bytes ?? new Uint8Array()).includes("Front Cover"),
  );
});

void test("without new artwork, the file's own pictures all stay", () => {
  const tag = id3(
    3,
    0,
    frame23("APIC", apic(3, 3)),
    frame23("APIC", apic(4, 4, "b")),
  );
  const copy = applied(concatBytes([tag, MP3]), "a.mp3", {
    ...TAGS,
    artwork: null,
  });
  assert.deepEqual([...(readBack(copy, "a.mp3").artwork ?? [])], [3, 3]);
  assert.equal(
    parseId3Frames(headOf(copy))?.frames.filter((frame) => frame.id === "APIC")
      .length,
    2,
  );
});

void test("a date and track that still match keep their full form", () => {
  const tag = id3(
    4,
    0,
    frame24("TDRC", utf8("2021-05-04")),
    frame24("TRCK", utf8("3/12")),
  );
  const same = readBack(
    applied(concatBytes([tag, MP3]), "a.mp3"),
    "a.mp3",
  ).tags;
  assert.equal(same.year, "2021-05-04");
  assert.equal(same.track, "3/12");
  const edited = readBack(
    applied(concatBytes([tag, MP3]), "a.mp3", {
      ...TAGS,
      track: 4,
      year: 1999,
    }),
    "a.mp3",
  ).tags;
  assert.equal(edited.year, "1999");
  assert.equal(edited.track, "4");
});

void test("2.3's date frames stay with their year, and go when it changes", () => {
  const tag = id3(
    3,
    0,
    frame23("TYER", latin1("2021")),
    frame23("TDAT", latin1("0405")),
  );
  const same = applied(concatBytes([tag, MP3]), "a.mp3");
  assert.ok(frameBytes(same, "TDAT"));
  const edited = applied(concatBytes([tag, MP3]), "a.mp3", {
    ...TAGS,
    year: 1999,
  });
  assert.equal(frameBytes(edited, "TDAT"), undefined);
});

void test("cleared values leave no frame behind", () => {
  const tag = id3(
    3,
    0,
    frame23("TALB", latin1("Old")),
    frame23("TPE2", latin1("Old")),
    frame23("TYER", latin1("2000")),
    frame23("TRCK", latin1("1")),
  );
  const copy = applied(concatBytes([tag, MP3]), "a.mp3", {
    album: null,
    albumArtists: [],
    artists: [],
    artwork: null,
    title: "",
    track: null,
    year: null,
  });
  assert.deepEqual(ids(headOf(copy)), []);
  endsWith(copy, MP3);
});

void test("reads every text encoding, and several values in one frame", () => {
  const utf16le = concatBytes([
    Uint8Array.of(1, 0xff, 0xfe),
    ...[..."東京 🎵"].flatMap((char) =>
      [...char].flatMap((unit) =>
        Array.from({ length: unit.length }, (_, index) => {
          const code = unit.charCodeAt(index);
          return Uint8Array.of(code & 0xff, code >> 8);
        }),
      ),
    ),
  ]);
  const utf16be = concatBytes([
    Uint8Array.of(2),
    ...[..."Beyoncé"].map((char) => {
      const code = char.charCodeAt(0);
      return Uint8Array.of(code >> 8, code & 0xff);
    }),
  ]);
  const tag = id3(
    4,
    0,
    frame24("TIT2", utf16le),
    frame24("TPE1", utf16be),
    frame24("TALB", latin1("Olé")),
    frame24("TPE2", utf8("A\0B")),
  );
  const read = readId3Tags(tag);
  assert.ok(read);
  assert.equal(read.tags.title, "東京 🎵");
  assert.equal(read.tags.artist, "Beyoncé");
  assert.equal(read.tags.album, "Olé");
  assert.equal(read.tags.albumArtist, "A, B");
});

void test("a compressed or encrypted frame can't be read, and is still kept", () => {
  const compressed = concatBytes([
    latin1Bytes("TIT2"),
    uint32BE(5),
    Uint8Array.of(0, 0x80),
    new Uint8Array(5).fill(9),
  ]);
  const tag = id3(3, 0, compressed, frame23("TCON", latin1("Jazz")));
  assert.equal(readId3Tags(tag)?.tags.title, null);
  const copy = applied(concatBytes([tag, MP3]), "a.mp3", {
    ...TAGS,
    title: "",
  });
  assert.ok(frameBytes(copy, "TCON"));
});

void test("emoji, CJK, right-to-left, and very long values round trip in 2.3 and 2.4", () => {
  const long = "Long 長い 🎵 ".repeat(5000);
  for (const version of [3, 4] as const) {
    const before = concatBytes([
      version === 3
        ? id3(3, 0, frame23("TIT2", latin1("Old")))
        : id3(4, 0, frame24("TIT2", utf8("Old"))),
      MP3,
    ]);
    const copy = applied(before, "a.mp3", { ...TAGS, title: long.trim() });
    assert.equal(readBack(copy, "a.mp3").tags.title, long.trim());
    endsWith(copy, MP3);
  }
});

void test("the compilation flag is TCMP, or ffmpeg's TXXX", () => {
  function compilation(...frames: Uint8Array[]) {
    return readId3Tags(id3(3, 0, ...frames))?.tags.compilation;
  }
  assert.equal(compilation(frame23("TCMP", latin1("1"))), true);
  assert.equal(compilation(frame23("TCMP", latin1("0"))), false);
  assert.equal(compilation(frame23("TXXX", latin1("compilation\x001"))), true);
  assert.equal(compilation(frame23("TXXX", latin1("mood\x001"))), false);
  assert.equal(compilation(frame23("TIT2", latin1("x"))), false);
});
