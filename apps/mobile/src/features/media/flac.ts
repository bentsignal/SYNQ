import type { EmbeddedTags, SongTags } from "./song-tags.ts";
import {
  concatBytes,
  firstNumber,
  latin1Bytes,
  latin1Text,
  readUint32BE,
  readUint32LE,
  uint32BE,
  uint32LE,
  utf8Bytes,
  utf8Text,
} from "./bytes.ts";
import { jpegSize } from "./jpeg.ts";

/**
 * FLAC metadata: `fLaC`, then blocks (STREAMINFO first) before the audio.
 * Tags are Vorbis comments (`TITLE=...`), the cover a PICTURE block.
 * AVFoundation plays FLAC but doesn't expose these, so import reads them
 * here, and export rewrites them in a copy, keeping every other block and
 * comment.
 */

export const FLAC_MARKER = "fLaC";

export const FLAC_BLOCK = {
  streamInfo: 0,
  padding: 1,
  vorbisComment: 4,
  picture: 6,
} as const;

/** Bytes of a block header: last-block flag and type, then a 24-bit length. */
export const FLAC_BLOCK_HEADER_LENGTH = 4;

/** Padding left after the blocks, so later edits can grow them in place. */
const PADDING = 1024;

/** The most a block's 24-bit length can say. */
const MAX_BLOCK_LENGTH = 0xffffff;

/** Vorbis comment fields SYNQ always replaces (compared case-insensitively). */
const OWN_FIELDS = new Set([
  "TITLE",
  "ARTIST",
  "ALBUM",
  "ALBUMARTIST",
  "ALBUM ARTIST",
]);

/** Picture types a new cover replaces: front cover, and "other" (ffmpeg's). */
const COVER_TYPES = new Set([0, 3]);

export interface FlacBlock {
  type: number;
  body: Uint8Array;
}

export function parseFlacBlockHeader(header: Uint8Array) {
  const first = header[0] ?? 0;
  return {
    last: (first & 0x80) !== 0,
    type: first & 0x7f,
    length:
      ((header[1] ?? 0) << 16) + ((header[2] ?? 0) << 8) + (header[3] ?? 0),
  };
}

function blockBytes(block: FlacBlock, last: boolean) {
  const length = block.body.length;
  if (length > MAX_BLOCK_LENGTH) {
    throw new RangeError("This block is too large for FLAC.");
  }
  return concatBytes([
    Uint8Array.of(
      (last ? 0x80 : 0) | block.type,
      (length >> 16) & 0xff,
      (length >> 8) & 0xff,
      length & 0xff,
    ),
    block.body,
  ]);
}

/** The length-prefixed (little-endian) string at `offset`, and where the next starts. */
function lengthPrefixed(body: Uint8Array, offset: number) {
  const length = readUint32LE(body, offset);
  return {
    next: offset + 4 + length,
    value: body.subarray(offset + 4, offset + 4 + length),
  };
}

/** Splits a Vorbis comment block into its vendor string and `KEY=value` fields. */
export function parseVorbisComment(body: Uint8Array) {
  const vendor = lengthPrefixed(body, 0);
  const count = readUint32LE(body, vendor.next);
  const fields = new Array<string>();
  const raw = new Array<Uint8Array>();
  let offset = vendor.next + 4;
  for (let index = 0; index < count && offset + 4 <= body.length; index++) {
    const field = lengthPrefixed(body, offset);
    fields.push(utf8Text(field.value));
    raw.push(field.value);
    offset = field.next;
  }
  return { fields, raw, vendor: vendor.value };
}

function vorbisCommentBody(vendor: Uint8Array, encoded: readonly Uint8Array[]) {
  return concatBytes([
    uint32LE(vendor.length),
    vendor,
    uint32LE(encoded.length),
    ...encoded.flatMap((field) => [uint32LE(field.length), field]),
  ]);
}

function fieldName(field: string) {
  const equals = field.indexOf("=");
  return (equals === -1 ? field : field.slice(0, equals)).toUpperCase();
}

/** The PICTURE block's parts; `type` 3 is the front cover. */
export function parsePicture(body: Uint8Array) {
  let offset = 0;
  const type = readUint32BE(body, offset);
  offset += 4;
  const mimeLength = readUint32BE(body, offset);
  const mimeType = latin1Text(
    body.subarray(offset + 4, offset + 4 + mimeLength),
  );
  offset += 4 + mimeLength;
  offset += 4 + readUint32BE(body, offset); // description
  offset += 16; // width, height, depth, colors
  const dataLength = readUint32BE(body, offset);
  return {
    type,
    mimeType,
    data: body.subarray(offset + 4, offset + 4 + dataLength),
  };
}

function pictureBody(jpeg: Uint8Array) {
  const size = jpegSize(jpeg);
  const mimeType = latin1Bytes("image/jpeg");
  return concatBytes([
    uint32BE(3),
    uint32BE(mimeType.length),
    mimeType,
    uint32BE(0),
    uint32BE(size?.width ?? 0),
    uint32BE(size?.height ?? 0),
    uint32BE(24),
    uint32BE(0),
    uint32BE(jpeg.length),
    jpeg,
  ]);
}

/** Fields whose several values are one list, as ARTIST=A and ARTIST=B are. */
const LIST_FIELDS = new Set(["ARTIST", "ALBUMARTIST", "ALBUM ARTIST"]);

/** Every Vorbis comment value by upper-cased name; several ARTIST fields join. */
function vorbisValues(blocks: readonly FlacBlock[]) {
  const values = new Map<string, string>();
  const fields = blocks
    .filter((block) => block.type === FLAC_BLOCK.vorbisComment)
    .flatMap((block) => parseVorbisComment(block.body).fields);
  for (const field of fields) {
    const name = fieldName(field);
    const value = field.slice(field.indexOf("=") + 1).trim();
    const previous = values.get(name);
    if (value === "") continue;
    if (previous === undefined) values.set(name, value);
    else if (LIST_FIELDS.has(name)) values.set(name, `${previous}, ${value}`);
  }
  return values;
}

/** The front cover's image bytes (else the first picture's), or null. */
function frontCover(blocks: readonly FlacBlock[]) {
  const pictures = blocks
    .filter((block) => block.type === FLAC_BLOCK.picture)
    .map((block) => parsePicture(block.body));
  const cover = pictures.find((picture) => picture.type === 3) ?? pictures[0];
  return cover === undefined || cover.data.length === 0 ? null : cover.data;
}

function firstValue(values: Map<string, string>, names: readonly string[]) {
  for (const name of names) {
    const value = values.get(name);
    if (value !== undefined) return value;
  }
  return null;
}

/** The tags and front cover in a file's metadata blocks, for import. */
export function readFlacTags(blocks: readonly FlacBlock[]) {
  const values = vorbisValues(blocks);
  const albumArtist = firstValue(values, ["ALBUMARTIST", "ALBUM ARTIST"]);
  return {
    artwork: frontCover(blocks),
    tags: {
      album: firstValue(values, ["ALBUM"]),
      albumArtist,
      artist: firstValue(values, ["ARTIST"]) ?? albumArtist,
      compilation: firstValue(values, ["COMPILATION"]) === "1",
      title: firstValue(values, ["TITLE"]),
      track: firstValue(values, ["TRACKNUMBER", "TRACK"]),
      year: firstValue(values, ["DATE", "YEAR"]),
    },
  } satisfies EmbeddedTags;
}

/** Whether a date or track field already says what the library does. */
function sameNumber(fields: readonly string[], name: string, value: number) {
  const found = fields.find((field) => fieldName(field) === name);
  return (
    found !== undefined &&
    firstNumber(found.slice(found.indexOf("=") + 1)) === value
  );
}

/** A field for a value, or none when there's nothing to say. */
function ownField(name: string, value: string | number | null) {
  return value === null || value === "" ? [] : [`${name}=${String(value)}`];
}

/**
 * The comment's fields for `tags`. A date or track that still says what the
 * library says stays as it was: "2021-05-04" and "3/12" don't shrink to
 * "2021" and "3" just because a title changed. The rest of the file's fields
 * stay byte for byte, even ones that aren't valid UTF-8.
 */
function commentFields(
  comments: readonly ReturnType<typeof parseVorbisComment>[],
  tags: SongTags,
) {
  const fields = comments.flatMap((comment) => comment.fields);
  const raw = comments.flatMap((comment) => comment.raw);
  const sameYear = tags.year !== null && sameNumber(fields, "DATE", tags.year);
  const sameTrack =
    tags.track !== null && sameNumber(fields, "TRACKNUMBER", tags.track);
  const own = [
    ...ownField("TITLE", tags.title),
    ...ownField("ARTIST", tags.artists.join(", ")),
    ...ownField("ALBUMARTIST", tags.albumArtists.join(", ")),
    ...ownField("ALBUM", tags.album),
    ...ownField("DATE", sameYear ? null : tags.year),
    ...ownField("TRACKNUMBER", sameTrack ? null : tags.track),
  ];
  const kept = raw.filter((_, index) => {
    const name = fieldName(fields[index] ?? "");
    if (name === "DATE" || name === "YEAR") return sameYear;
    if (name === "TRACKNUMBER") return sameTrack;
    return !OWN_FIELDS.has(name);
  });
  return [...own.map(utf8Bytes), ...kept];
}

/** Whether an export keeps a block as it is: all but comments, padding, and the cover it replaces. */
function keptBlock(block: FlacBlock, replacingCover: boolean) {
  if (block.type === FLAC_BLOCK.vorbisComment) return false;
  if (block.type === FLAC_BLOCK.padding) return false;
  if (block.type !== FLAC_BLOCK.picture || !replacingCover) return true;
  return !COVER_TYPES.has(parsePicture(block.body).type);
}

/**
 * `fLaC` and new metadata blocks for `tags`: STREAMINFO first, as it must be,
 * then the comments with SYNQ's fields replaced, the new cover ahead of any
 * other pictures (players show the first), the file's other blocks as they
 * were, and fresh padding. Without `tags.artwork`, the file's pictures stay.
 */
export function buildFlacHead(blocks: readonly FlacBlock[], tags: SongTags) {
  const comments = blocks
    .filter((block) => block.type === FLAC_BLOCK.vorbisComment)
    .map((block) => parseVorbisComment(block.body));
  const vendor = comments[0]?.vendor ?? utf8Bytes("SYNQ");
  const kept = blocks.filter((block) =>
    keptBlock(block, tags.artwork !== null),
  );
  const streamInfo = kept.filter(
    (block) => block.type === FLAC_BLOCK.streamInfo,
  );
  const others = kept.filter((block) => block.type !== FLAC_BLOCK.streamInfo);
  const out = [
    ...streamInfo,
    {
      body: vorbisCommentBody(vendor, commentFields(comments, tags)),
      type: FLAC_BLOCK.vorbisComment,
    },
    ...(tags.artwork === null
      ? []
      : [{ body: pictureBody(tags.artwork), type: FLAC_BLOCK.picture }]),
    ...others,
    { body: new Uint8Array(PADDING), type: FLAC_BLOCK.padding },
  ];
  return concatBytes([
    latin1Bytes(FLAC_MARKER),
    ...out.map((block, index) => blockBytes(block, index === out.length - 1)),
  ]);
}
