/** FLAC exports and import. */
import assert from "node:assert/strict";
import { test } from "node:test";

import { bytesSource } from "./byte-source.ts";
import { concatBytes, latin1Bytes, latin1Text, uint32BE } from "./bytes.ts";
import {
  FLAC_BLOCK,
  parseFlacBlockHeader,
  parsePicture,
  parseVorbisComment,
} from "./flac.ts";
import {
  applied,
  assertWritten,
  COVER,
  endsWith,
  FLAC,
  flacWith,
  frame23,
  id3,
  latin1,
  readBack,
  TAGS,
  vorbisBody,
} from "./retag-testing.ts";
import { planRetag, readFlacBlocks } from "./retag.ts";

function pictureBody(type: number, data: Uint8Array) {
  const mime = latin1Bytes("image/jpeg");
  return concatBytes([
    uint32BE(type),
    uint32BE(mime.length),
    mime,
    uint32BE(0),
    new Uint8Array(16),
    uint32BE(data.length),
    data,
  ]);
}

function flacAudio() {
  const read = readFlacBlocks(bytesSource(FLAC));
  assert.ok(read);
  return FLAC.subarray(read.end);
}

function blocksIn(bytes: Uint8Array) {
  const read = readFlacBlocks(bytesSource(bytes));
  assert.ok(read);
  return read.blocks;
}

void test("FLAC with no comment gets one, STREAMINFO first, audio untouched", () => {
  const copy = applied(flacWith(), "a.flac");
  assertWritten(copy, "a.flac");
  endsWith(copy, flacAudio());
  assert.equal(blocksIn(copy)[0]?.type, FLAC_BLOCK.streamInfo);
  assert.deepEqual(blocksIn(copy)[0]?.body, blocksIn(FLAC)[0]?.body);
  // Exactly one block says it's the last, and it really is.
  let offset = 4;
  for (;;) {
    const header = parseFlacBlockHeader(copy.subarray(offset, offset + 4));
    offset += 4 + header.length;
    if (header.last) break;
  }
  assert.deepEqual(copy.subarray(offset), flacAudio());
});

void test("FLAC keeps its other comments and blocks", () => {
  const application = { body: latin1Bytes("TESTdata"), type: 2 };
  const copy = applied(
    flacWith(
      {
        body: vorbisBody([
          "TITLE=Old",
          "artist=A",
          "ARTIST=B",
          "albumartist=Old",
          "GENRE=Jazz",
          "REPLAYGAIN_TRACK_GAIN=-3.21 dB",
        ]),
        type: FLAC_BLOCK.vorbisComment,
      },
      application,
      { body: new Uint8Array(1_000_000), type: FLAC_BLOCK.padding },
    ),
    "a.flac",
  );
  assertWritten(copy, "a.flac");
  endsWith(copy, flacAudio());
  const blocks = blocksIn(copy);
  const comment = blocks.find(
    (block) => block.type === FLAC_BLOCK.vorbisComment,
  );
  const fields = parseVorbisComment(comment?.body ?? new Uint8Array()).fields;
  assert.ok(fields.includes("GENRE=Jazz"));
  assert.ok(fields.includes("REPLAYGAIN_TRACK_GAIN=-3.21 dB"));
  assert.equal(fields.filter((field) => /^artist=/i.test(field)).length, 1);
  assert.equal(
    fields.filter((field) => /^albumartist=/i.test(field)).length,
    1,
  );
  assert.deepEqual(
    blocks.find((block) => block.type === 2)?.body,
    application.body,
  );
  assert.ok(copy.length < 10_000 + FLAC.length, "the padding shrank");
});

void test("FLAC: the new cover comes first and a back cover stays", () => {
  const back = pictureBody(4, Uint8Array.of(4, 4));
  const front = pictureBody(3, Uint8Array.of(3, 3));
  const before = flacWith(
    { body: back, type: FLAC_BLOCK.picture },
    { body: vorbisBody([]), type: FLAC_BLOCK.vorbisComment },
    { body: front, type: FLAC_BLOCK.picture },
  );
  assert.deepEqual([...(readBack(before, "a.flac").artwork ?? [])], [3, 3]);
  const pictures = blocksIn(applied(before, "a.flac"))
    .filter((block) => block.type === FLAC_BLOCK.picture)
    .map((block) => parsePicture(block.body));
  assert.deepEqual(
    pictures.map((picture) => picture.type),
    [3, 4],
  );
  assert.deepEqual([...(pictures[0]?.data ?? [])], [...COVER]);
});

void test("FLAC: a date and track that still match keep their full form", () => {
  const before = flacWith({
    body: vorbisBody(["DATE=2021-05-04", "TRACKNUMBER=3/12"]),
    type: FLAC_BLOCK.vorbisComment,
  });
  const same = readBack(applied(before, "a.flac"), "a.flac").tags;
  assert.equal(same.year, "2021-05-04");
  assert.equal(same.track, "3/12");
  const edited = readBack(
    applied(before, "a.flac", { ...TAGS, track: 9, year: 1999 }),
    "a.flac",
  ).tags;
  assert.equal(edited.year, "1999");
  assert.equal(edited.track, "9");
});

void test("FLAC: a field that isn't UTF-8 stays byte for byte", () => {
  const latin = Uint8Array.of(...latin1Bytes("COMMENT=caf"), 0xe9);
  const copy = applied(
    flacWith({ body: vorbisBody([latin]), type: FLAC_BLOCK.vorbisComment }),
    "a.flac",
  );
  const comment = blocksIn(copy).find(
    (block) => block.type === FLAC_BLOCK.vorbisComment,
  );
  const { raw } = parseVorbisComment(comment?.body ?? new Uint8Array());
  assert.ok(raw.some((field) => field[field.length - 1] === 0xe9));
});

void test("FLAC reads album artists, the compilation flag, and joins several", () => {
  const before = flacWith({
    body: vorbisBody(["ALBUMARTIST=A", "ALBUMARTIST=B", "COMPILATION=1"]),
    type: FLAC_BLOCK.vorbisComment,
  });
  const { tags } = readBack(before, "a.flac");
  assert.equal(tags.albumArtist, "A, B");
  assert.equal(tags.compilation, true);
  assert.equal(tags.artist, "A, B", "falls back to it, as before");
});

void test("FLAC with a leading ID3 tag: Vorbis comments win, and the tag goes", () => {
  const before = concatBytes([
    id3(3, 0, frame23("TIT2", latin1("ID3 Title"))),
    flacWith({
      body: vorbisBody(["TITLE=Vorbis Title"]),
      type: FLAC_BLOCK.vorbisComment,
    }),
  ]);
  assert.equal(readBack(before, "a.flac").tags.title, "Vorbis Title");
  const copy = applied(before, "a.flac");
  assert.equal(latin1Text(copy.subarray(0, 4)), "fLaC");
  endsWith(copy, flacAudio());
});

void test("a cover too big for a FLAC block refuses, rather than corrupting", () => {
  assert.throws(
    () =>
      planRetag(bytesSource(FLAC), "a.flac", {
        ...TAGS,
        artwork: new Uint8Array(0x1000000),
      }),
    RangeError,
  );
});

void test("a truncated FLAC isn't tagged", () => {
  assert.equal(
    planRetag(bytesSource(FLAC.subarray(0, 20)), "a.flac", TAGS),
    null,
  );
});

void test("FLAC: a second comment block's fields aren't lost", () => {
  const copy = applied(
    flacWith(
      { body: vorbisBody(["GENRE=Jazz"]), type: FLAC_BLOCK.vorbisComment },
      { body: vorbisBody(["MOOD=Calm"]), type: FLAC_BLOCK.vorbisComment },
    ),
    "a.flac",
  );
  const comments = blocksIn(copy).filter(
    (block) => block.type === FLAC_BLOCK.vorbisComment,
  );
  assert.equal(comments.length, 1);
  const { fields } = parseVorbisComment(comments[0]?.body ?? new Uint8Array());
  assert.ok(fields.includes("GENRE=Jazz"));
  assert.ok(fields.includes("MOOD=Calm"));
});
