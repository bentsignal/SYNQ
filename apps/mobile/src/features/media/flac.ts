import type { RawTags, SongTags } from "./song-tags.ts";
import {
  concatBytes,
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

/** Vorbis comment fields SYNQ writes (compared case-insensitively). */
const OWN_FIELDS = new Set(["TITLE", "ARTIST", "ALBUM", "DATE", "TRACKNUMBER"]);

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
  let offset = vendor.next + 4;
  for (let index = 0; index < count && offset + 4 <= body.length; index++) {
    const field = lengthPrefixed(body, offset);
    fields.push(utf8Text(field.value));
    offset = field.next;
  }
  return { fields, vendor: vendor.value };
}

function vorbisCommentBody(vendor: Uint8Array, fields: readonly string[]) {
  const encoded = fields.map(utf8Bytes);
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
    else if (name === "ARTIST") values.set(name, `${previous}, ${value}`);
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
  return {
    artwork: frontCover(blocks),
    tags: {
      album: firstValue(values, ["ALBUM"]),
      artist: firstValue(values, ["ARTIST", "ALBUMARTIST"]),
      title: firstValue(values, ["TITLE"]),
      track: firstValue(values, ["TRACKNUMBER"]),
      year: firstValue(values, ["DATE", "YEAR"]),
    } satisfies RawTags,
  };
}

/** SYNQ's Vorbis comment fields for `tags`. */
function ownFields(tags: SongTags) {
  return [
    tags.title === "" ? null : `TITLE=${tags.title}`,
    tags.artists.length === 0 ? null : `ARTIST=${tags.artists.join(", ")}`,
    tags.album === null ? null : `ALBUM=${tags.album}`,
    tags.year === null ? null : `DATE=${String(tags.year)}`,
    tags.track === null ? null : `TRACKNUMBER=${String(tags.track)}`,
  ].filter((field) => field !== null);
}

/**
 * Blocks an export keeps as they are: all but comments, padding, and (when
 * SYNQ has a cover) pictures, which players show in file order, so an old
 * cover would win.
 */
function keptBlock(block: FlacBlock, replacingCover: boolean) {
  if (block.type === FLAC_BLOCK.vorbisComment) return false;
  if (block.type === FLAC_BLOCK.padding) return false;
  return !(replacingCover && block.type === FLAC_BLOCK.picture);
}

/**
 * `fLaC` and new metadata blocks for `tags`: STREAMINFO and the file's
 * other blocks as they were, its Vorbis comments with SYNQ's fields
 * replaced, its pictures replaced by the cover when `tags.artwork` is set,
 * and fresh padding.
 */
export function buildFlacHead(blocks: readonly FlacBlock[], tags: SongTags) {
  const comment = blocks.find(
    (block) => block.type === FLAC_BLOCK.vorbisComment,
  );
  const parsed =
    comment === undefined ? null : parseVorbisComment(comment.body);
  const fields = [
    ...ownFields(tags),
    ...(parsed?.fields ?? []).filter(
      (field) => !OWN_FIELDS.has(fieldName(field)),
    ),
  ];
  const vendor = parsed?.vendor ?? utf8Bytes("SYNQ");
  const out = [
    ...blocks.filter((block) => keptBlock(block, tags.artwork !== null)),
    { body: vorbisCommentBody(vendor, fields), type: FLAC_BLOCK.vorbisComment },
    ...(tags.artwork === null
      ? []
      : [{ body: pictureBody(tags.artwork), type: FLAC_BLOCK.picture }]),
    { body: new Uint8Array(PADDING), type: FLAC_BLOCK.padding },
  ];
  return concatBytes([
    latin1Bytes(FLAC_MARKER),
    ...out.map((block, index) => blockBytes(block, index === out.length - 1)),
  ]);
}
