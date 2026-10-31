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

/** Splits a Vorbis comment block into its vendor string and `KEY=value` fields. */
export function parseVorbisComment(body: Uint8Array) {
  let offset = 0;
  const next = () => {
    const length = readUint32LE(body, offset);
    const value = body.subarray(offset + 4, offset + 4 + length);
    offset += 4 + length;
    return value;
  };
  const vendor = next();
  const count = readUint32LE(body, offset);
  offset += 4;
  const fields: string[] = [];
  for (let index = 0; index < count && offset + 4 <= body.length; index++) {
    fields.push(utf8Text(next()));
  }
  return { vendor, fields };
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
  const mimeType = latin1Text(body.subarray(offset + 4, offset + 4 + mimeLength));
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

/** The tags and front cover in a file's metadata blocks, for import. */
export function readFlacTags(blocks: readonly FlacBlock[]) {
  const values = new Map<string, string>();
  for (const block of blocks) {
    if (block.type !== FLAC_BLOCK.vorbisComment) continue;
    for (const field of parseVorbisComment(block.body).fields) {
      const name = fieldName(field);
      const value = field.slice(field.indexOf("=") + 1).trim();
      if (value === "") continue;
      // Several ARTIST fields are several artists.
      const previous = values.get(name);
      values.set(
        name,
        previous !== undefined && name === "ARTIST"
          ? `${previous}, ${value}`
          : (previous ?? value),
      );
    }
  }
  const pictures = blocks
    .filter((block) => block.type === FLAC_BLOCK.picture)
    .map((block) => parsePicture(block.body));
  const cover =
    pictures.find((picture) => picture.type === 3) ?? pictures[0] ?? null;
  const tags: RawTags = {
    title: values.get("TITLE") ?? null,
    artist: values.get("ARTIST") ?? values.get("ALBUMARTIST") ?? null,
    album: values.get("ALBUM") ?? null,
    year: values.get("DATE") ?? values.get("YEAR") ?? null,
    track: values.get("TRACKNUMBER") ?? null,
  };
  return { tags, artwork: cover?.data.length ? cover.data : null };
}

/**
 * `fLaC` and new metadata blocks for `tags`: STREAMINFO and the file's
 * other blocks as they were, its Vorbis comments with SYNQ's fields
 * replaced, the cover replaced when `tags.artwork` is set, and fresh
 * padding.
 */
export function buildFlacHead(blocks: readonly FlacBlock[], tags: SongTags) {
  const comment = blocks.find(
    (block) => block.type === FLAC_BLOCK.vorbisComment,
  );
  const parsed =
    comment === undefined ? null : parseVorbisComment(comment.body);
  const fields = [
    ...(tags.title === "" ? [] : [`TITLE=${tags.title}`]),
    ...(tags.artists.length > 0 ? [`ARTIST=${tags.artists.join(", ")}`] : []),
    ...(tags.album === null ? [] : [`ALBUM=${tags.album}`]),
    ...(tags.year === null ? [] : [`DATE=${tags.year}`]),
    ...(tags.track === null ? [] : [`TRACKNUMBER=${tags.track}`]),
    ...(parsed?.fields ?? []).filter(
      (field) => !OWN_FIELDS.has(fieldName(field)),
    ),
  ];
  const vendor = parsed?.vendor ?? utf8Bytes("SYNQ");
  const kept = blocks.filter(
    (block) =>
      block.type !== FLAC_BLOCK.vorbisComment &&
      block.type !== FLAC_BLOCK.padding &&
      !(
        block.type === FLAC_BLOCK.picture &&
        tags.artwork !== null &&
        parsePicture(block.body).type === 3
      ),
  );
  const out: FlacBlock[] = [
    ...kept,
    { type: FLAC_BLOCK.vorbisComment, body: vorbisCommentBody(vendor, fields) },
    ...(tags.artwork === null
      ? []
      : [{ type: FLAC_BLOCK.picture, body: pictureBody(tags.artwork) }]),
    { type: FLAC_BLOCK.padding, body: new Uint8Array(PADDING) },
  ];
  return concatBytes([
    latin1Bytes(FLAC_MARKER),
    ...out.map((block, index) => blockBytes(block, index === out.length - 1)),
  ]);
}
