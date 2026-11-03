/** M4A exports and import. */
import assert from "node:assert/strict";
import { test } from "node:test";

import { bytesSource } from "./byte-source.ts";
import {
  concatBytes,
  latin1Bytes,
  latin1Text,
  readUint32BE,
  uint32BE,
} from "./bytes.ts";
import {
  applied,
  assertWritten,
  COVER,
  M4A,
  M4A_FASTSTART,
  readBack,
  TAGS,
} from "./retag-testing.ts";
import { planRetag } from "./retag.ts";

/** The top-level atoms of an MP4, in order. */
function atomsOf(bytes: Uint8Array) {
  const atoms = new Array<{ type: string; offset: number; size: number }>();
  let offset = 0;
  while (offset + 8 <= bytes.length) {
    const size = readUint32BE(bytes, offset);
    const type = latin1Text(bytes.subarray(offset + 4, offset + 8));
    atoms.push({ offset, size, type });
    assert.ok(size >= 8, `bad atom ${type}`);
    offset += size;
  }
  assert.equal(offset, bytes.length, "the atoms should reach the end");
  return atoms;
}

function mdatOf(bytes: Uint8Array) {
  const mdat = atomsOf(bytes).find((atom) => atom.type === "mdat");
  assert.ok(mdat);
  return {
    bytes: bytes.subarray(mdat.offset, mdat.offset + mdat.size),
    offset: mdat.offset,
  };
}

/** The one `moov`, as text: good enough to find its items' names in. */
function moovText(bytes: Uint8Array) {
  const moovs = atomsOf(bytes).filter((atom) => atom.type === "moov");
  assert.equal(moovs.length, 1, "exactly one moov");
  const [moov] = moovs;
  assert.ok(moov);
  return latin1Text(bytes.subarray(moov.offset, moov.offset + moov.size));
}

void test("M4A, moov after the audio: tagged, and the audio doesn't move", () => {
  const before = mdatOf(M4A);
  const copy = applied(M4A, "a.m4a");
  assertWritten(copy, "a.m4a");
  const after = mdatOf(copy);
  assert.equal(after.offset, before.offset, "chunk offsets stay valid");
  assert.deepEqual(after.bytes, before.bytes);
});

void test("M4A, moov ahead of the audio: tagged in the right order, offsets still valid", () => {
  const before = mdatOf(M4A_FASTSTART);
  const copy = applied(M4A_FASTSTART, "a.m4a");
  assertWritten(copy, "a.m4a");
  const after = mdatOf(copy);
  assert.equal(after.offset, before.offset);
  assert.deepEqual(after.bytes, before.bytes);
  const types = atomsOf(copy).map((atom) => atom.type);
  assert.ok(types.includes("free"), "the old moov is now free space");
});

void test("M4A: other items survive, and matching numbers keep their full form", () => {
  const { tags } = readBack(M4A, "a.m4a");
  assert.equal(tags.albumArtist, "Old Album Artist");
  assert.equal(tags.compilation, true);
  assert.equal(tags.year, "2021-05-04");
  const copy = applied(M4A, "a.m4a");
  const moov = moovText(copy);
  assert.ok(moov.includes("©gen"), "keeps its genre");
  assert.ok(moov.includes("cpil"), "keeps its compilation flag");
  assert.equal(
    readBack(copy, "a.m4a").tags.year,
    "2021-05-04",
    "keeps its date",
  );
  // The total survives: bytes 2-3 the track, bytes 4-5 the total.
  const at = moov.indexOf("trkn");
  assert.equal(moov.charCodeAt(at + 4 + 8 + 8 + 3), 3);
  assert.equal(moov.charCodeAt(at + 4 + 8 + 8 + 5), 12);
  assert.ok(moov.indexOf("covr") > moov.indexOf("©gen"), "the cover goes last");
});

void test("M4A: the file's cover stays without new artwork, and a new one replaces it", () => {
  const withCover = applied(M4A, "a.m4a");
  const kept = applied(withCover, "a.m4a", {
    ...TAGS,
    artwork: null,
    title: "Next",
  });
  assert.deepEqual([...(readBack(kept, "a.m4a").artwork ?? [])], [...COVER]);
  const replaced = applied(withCover, "a.m4a", {
    ...TAGS,
    artwork: Uint8Array.of(9, 9),
  });
  assert.deepEqual([...(readBack(replaced, "a.m4a").artwork ?? [])], [9, 9]);
});

void test("M4A: tagging a tagged copy again doesn't grow it without end", () => {
  const once = applied(M4A_FASTSTART, "a.m4a");
  const twice = applied(once, "a.m4a");
  assertWritten(twice, "a.m4a");
  assert.equal(
    twice.length,
    once.length,
    "it fits in the free space the first left",
  );
  assert.deepEqual(mdatOf(twice).bytes, mdatOf(M4A_FASTSTART).bytes);
});

function atom(type: string, ...content: Uint8Array[]) {
  const body = concatBytes(content);
  return concatBytes([uint32BE(body.length + 8), latin1Bytes(type), body]);
}

const FTYP = atom("ftyp", latin1Bytes("M4A "), uint32BE(0));
const MDAT = atom("mdat", new Uint8Array(64).fill(0xaa));
const MVHD = atom("mvhd", new Uint8Array(100));

void test("M4A with no udta or meta gets them", () => {
  const before = concatBytes([FTYP, MDAT, atom("moov", MVHD)]);
  const copy = applied(before, "a.m4a");
  assertWritten(copy, "a.m4a");
  assert.ok(moovText(copy).includes("mdir"), "with a metadata handler");
  assert.ok(moovText(copy).includes("mvhd"));
});

void test("M4A with QuickTime's plain meta atom", () => {
  const hdlr = atom(
    "hdlr",
    new Uint8Array(8),
    latin1Bytes("mdirappl"),
    new Uint8Array(9),
  );
  const before = concatBytes([
    FTYP,
    MDAT,
    atom("moov", MVHD, atom("udta", atom("meta", hdlr))),
  ]);
  assertWritten(applied(before, "a.m4a"), "a.m4a");
});

void test("M4A: what can't be done safely is left to the native tagger", () => {
  const moov = atom("moov", MVHD);
  for (const [why, bytes] of [
    ["fragments", concatBytes([FTYP, moov, atom("moof"), MDAT])],
    ["mvex", concatBytes([FTYP, atom("moov", MVHD, atom("mvex")), MDAT])],
    ["no moov", concatBytes([FTYP, MDAT])],
    ["two moovs", concatBytes([FTYP, moov, MDAT, moov])],
    ["trailing junk", concatBytes([FTYP, moov, MDAT, Uint8Array.of(1, 2, 3)])],
    [
      "mdat running to the end",
      concatBytes([
        FTYP,
        moov,
        uint32BE(0),
        latin1Bytes("mdat"),
        new Uint8Array(40),
      ]),
    ],
  ] as const) {
    assert.equal(planRetag(bytesSource(bytes), "a.m4a", TAGS), null, why);
  }
});
