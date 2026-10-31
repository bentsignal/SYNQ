import type { SongTags } from "./song-tags.ts";
import {
  concatBytes,
  latin1Bytes,
  latin1Text,
  readUint32BE,
  uint32BE,
  utf8Bytes,
  utf16Bytes,
} from "./bytes.ts";

/**
 * ID3v2 tags, the start of an MP3 file. Exports rewrite the tag in a copy:
 * SYNQ's fields replace the file's, and every other frame (genre, lyrics,
 * comments...) is kept byte for byte. The tag keeps the file's version
 * (2.3 or 2.4); files with none, or with 2.2 or whole-tag unsynchronisation
 * (rare), get a fresh ID3v2.3 tag, which every player reads.
 */

/** Bytes to read from the start of a file to size its tag. */
export const ID3_HEADER_LENGTH = 10;

/** Padding after the frames, so later edits can grow the tag in place. */
const PADDING = 512;

/** Frames SYNQ writes. Year is TYER in 2.3 and TDRC in 2.4. */
const OWN_FRAMES = new Set(["TIT2", "TPE1", "TALB", "TRCK", "TYER", "TDRC"]);

interface RawFrame {
  id: string;
  /** The whole frame: header and body, as found. */
  bytes: Uint8Array;
}

function syncsafe(bytes: Uint8Array, offset: number) {
  return (
    ((bytes[offset] ?? 0) & 0x7f) * 0x200000 +
    (((bytes[offset + 1] ?? 0) & 0x7f) << 14) +
    (((bytes[offset + 2] ?? 0) & 0x7f) << 7) +
    ((bytes[offset + 3] ?? 0) & 0x7f)
  );
}

function toSyncsafe(value: number) {
  return Uint8Array.of(
    (value >>> 21) & 0x7f,
    (value >>> 14) & 0x7f,
    (value >>> 7) & 0x7f,
    value & 0x7f,
  );
}

/**
 * The length of the ID3v2 tag at the start of a file, from its first 10
 * bytes (0 when there is none): the bytes an export replaces.
 */
export function id3TagLength(header: Uint8Array) {
  if (
    header.length < ID3_HEADER_LENGTH ||
    latin1Text(header.subarray(0, 3)) !== "ID3"
  ) {
    return 0;
  }
  const version = header[3] ?? 0;
  const flags = header[5] ?? 0;
  const footer = version === 4 && (flags & 0x10) !== 0 ? 10 : 0;
  return ID3_HEADER_LENGTH + syncsafe(header, 6) + footer;
}

/** Where a tag's frames start: after the header and any extended header. */
function framesStart(tag: Uint8Array, version: 3 | 4) {
  if (((tag[5] ?? 0) & 0x40) === 0) return ID3_HEADER_LENGTH;
  // The extended header's size excludes itself in 2.3, includes it in 2.4.
  return (
    ID3_HEADER_LENGTH +
    (version === 3
      ? readUint32BE(tag, ID3_HEADER_LENGTH) + 4
      : syncsafe(tag, ID3_HEADER_LENGTH))
  );
}

function readFrames(tag: Uint8Array, version: 3 | 4) {
  const end = Math.min(tag.length, ID3_HEADER_LENGTH + syncsafe(tag, 6));
  const frames = new Array<RawFrame>();
  let offset = framesStart(tag, version);
  while (offset + 10 <= end) {
    const id = latin1Text(tag.subarray(offset, offset + 4));
    const size =
      version === 4 ? syncsafe(tag, offset + 4) : readUint32BE(tag, offset + 4);
    const next = offset + 10 + size;
    // Padding (zeros) or a damaged frame ends the list.
    if (!/^[A-Z0-9]{4}$/.test(id) || size === 0 || next > end) break;
    frames.push({ bytes: tag.slice(offset, next), id });
    offset = next;
  }
  return frames;
}

/** The frames of a 2.3 or 2.4 tag, or null when they can't be kept as-is. */
export function parseId3Frames(tag: Uint8Array) {
  if (id3TagLength(tag) === 0) return null;
  const version = tag[3];
  // Whole-tag unsynchronisation (rare) would need decoding first.
  const unsynchronised = ((tag[5] ?? 0) & 0x80) !== 0;
  if ((version !== 3 && version !== 4) || unsynchronised) return null;
  return { frames: readFrames(tag, version), version };
}

function frame(id: string, body: Uint8Array, version: 3 | 4) {
  const size = version === 4 ? toSyncsafe(body.length) : uint32BE(body.length);
  return concatBytes([latin1Bytes(id), size, Uint8Array.of(0, 0), body]);
}

function textFrame(id: string, text: string, version: 3 | 4) {
  // 2.4: UTF-8 (encoding 3). 2.3: UTF-16 with a byte order mark (1).
  const body =
    version === 4
      ? concatBytes([Uint8Array.of(3), utf8Bytes(text)])
      : concatBytes([Uint8Array.of(1), utf16Bytes(text)]);
  return frame(id, body, version);
}

function pictureFrame(jpeg: Uint8Array, version: 3 | 4) {
  // Latin-1 MIME type, picture type 3 (front cover), empty description.
  const body = concatBytes([
    Uint8Array.of(0),
    latin1Bytes("image/jpeg"),
    Uint8Array.of(0, 3, 0),
    jpeg,
  ]);
  return frame("APIC", body, version);
}

/** SYNQ's frames for `tags`. */
function ownFrames(tags: SongTags, version: 3 | 4) {
  const text = [
    ["TIT2", tags.title === "" ? null : tags.title],
    ["TPE1", tags.artists.length === 0 ? null : tags.artists.join(", ")],
    ["TALB", tags.album],
    [
      version === 4 ? "TDRC" : "TYER",
      tags.year === null ? null : String(tags.year),
    ],
    ["TRCK", tags.track === null ? null : String(tags.track)],
  ] as const;
  return [
    ...text.flatMap(([id, value]) =>
      value === null ? [] : [textFrame(id, value, version)],
    ),
    ...(tags.artwork === null ? [] : [pictureFrame(tags.artwork, version)]),
  ];
}

/**
 * A complete ID3v2 tag for `tags`, keeping `existing`'s other frames. The
 * file's own artwork stays unless `tags.artwork` replaces it.
 */
export function buildId3Tag(tags: SongTags, existing: Uint8Array | null) {
  const parsed = existing === null ? null : parseId3Frames(existing);
  const version = parsed?.version === 4 ? 4 : 3;
  const kept = (parsed?.frames ?? []).filter(
    ({ id }) =>
      !OWN_FRAMES.has(id) && !(id === "APIC" && tags.artwork !== null),
  );
  const frames = concatBytes([
    ...ownFrames(tags, version),
    ...kept.map((frame) => frame.bytes),
  ]);
  const header = concatBytes([
    latin1Bytes("ID3"),
    Uint8Array.of(version, 0, 0),
    toSyncsafe(frames.length + PADDING),
  ]);
  return concatBytes([header, frames, new Uint8Array(PADDING)]);
}
