import type { Id3Frame } from "./id3-frames.ts";
import type { EmbeddedTags, SongTags } from "./song-tags.ts";
import {
  concatBytes,
  firstNumber,
  latin1Bytes,
  latin1Text,
  utf8Bytes,
  utf8Text,
  utf16Bytes,
  utf16Text,
} from "./bytes.ts";
import {
  frame,
  parseId3Frames,
  removeUnsync,
  toSyncsafe,
} from "./id3-frames.ts";

export {
  ID3_HEADER_LENGTH,
  id3TagLength,
  parseId3Frames,
} from "./id3-frames.ts";

/**
 * ID3v2 tags, at the start of an MP3 or AAC stream or in a WAV chunk.
 * AVFoundation skips ID3v2.2, tags with an extended header, and all but the
 * first value of a frame, so SYNQ reads them here. Exports rewrite the tag in
 * a copy: SYNQ's fields replace the file's, and every other frame (genre,
 * lyrics, comments, replay gain, a back cover...) is kept byte for byte. A
 * 2.4 tag stays 2.4; anything else becomes 2.3, which every player reads.
 * See docs/audio-tags.md.
 */

/** Padding after the frames, so later edits can grow the tag in place. */
const PADDING = 512;

/** A syncsafe tag size can't reach this: 28 bits. */
const MAX_TAG_SIZE = 0x10000000;

const YEAR_FRAMES = new Set(["TYER", "TDAT", "TIME", "TDRC"]);

/** Frames SYNQ always replaces. Year and track have their own rules below. */
const OWN_FRAMES = new Set(["TIT2", "TPE1", "TPE2", "TALB", "TRCK"]);

/** Picture types a new cover replaces: front cover, and "other" (ffmpeg's). */
const COVER_TYPES = new Set([0, 3]);

/** A frame's body, undoing what its flags say was done to it; null if unreadable. */
function frameBody({ bytes }: Id3Frame, version: 3 | 4) {
  const flags = bytes[9] ?? 0;
  const body = bytes.subarray(10);
  if (version === 3) {
    // Compression or encryption; a group byte sits ahead of the body.
    if ((flags & 0xc0) !== 0) return null;
    return (flags & 0x20) === 0 ? body : body.subarray(1);
  }
  if ((flags & 0x0c) !== 0) return null;
  const group = (flags & 0x40) === 0 ? 0 : 1;
  const lengthField = (flags & 0x01) === 0 ? 0 : 4;
  const content = body.subarray(group + lengthField);
  return (flags & 0x02) === 0 ? content : removeUnsync(content);
}

function decodeText(body: Uint8Array, encoding: number) {
  switch (encoding) {
    case 1:
      return utf16Text(body);
    case 2:
      return utf16Text(body, true);
    case 3:
      return utf8Text(body);
    default:
      return latin1Text(body);
  }
}

/** A text frame's values: 2.4 separates several with a NUL. */
function textValues(body: Uint8Array) {
  return decodeText(body.subarray(1), body[0] ?? 0)
    .split("\0")
    .map((value) => value.trim())
    .filter((value) => value !== "");
}

/** How far a string runs in a frame, by its encoding's terminator. */
function terminated(body: Uint8Array, start: number, encoding: number) {
  const wide = encoding === 1 || encoding === 2;
  const step = wide ? 2 : 1;
  for (let index = start; index + step <= body.length; index += step) {
    if (body[index] === 0 && (!wide || body[index + 1] === 0)) {
      return { end: index, next: index + step };
    }
  }
  return { end: body.length, next: body.length };
}

/** An APIC body's parts. */
function parseApic(body: Uint8Array) {
  const encoding = body[0] ?? 0;
  const mime = terminated(body, 1, 0);
  const type = body[mime.next] ?? 0;
  const description = terminated(body, mime.next + 1, encoding);
  return {
    data: body.subarray(description.next),
    description: decodeText(
      body.subarray(mime.next + 1, description.end),
      encoding,
    ),
    type,
  };
}

function pictureOf(frameToRead: Id3Frame, version: 3 | 4) {
  const body = frameBody(frameToRead, version);
  return body === null ? null : parseApic(body);
}

/**
 * The compilation flag: TCMP, or the TXXX frame ffmpeg writes in its place, a
 * description and then a value.
 */
function isCompilation(frames: readonly Id3Frame[], version: 3 | 4) {
  return frames.some((candidate) => {
    if (candidate.id !== "TCMP" && candidate.id !== "TXXX") return false;
    const body = frameBody(candidate, version);
    if (body === null) return false;
    const values = textValues(body);
    return candidate.id === "TCMP"
      ? values[0] === "1"
      : values[0]?.toLowerCase() === "compilation" && values[1] === "1";
  });
}

/** The tags and front cover in an ID3v2 tag, for import. */
export function readId3Tags(tag: Uint8Array) {
  const parsed = parseId3Frames(tag);
  if (parsed === null) return null;
  const { frames, version } = parsed;
  function text(id: string) {
    const found = frames.find((candidate) => candidate.id === id);
    const body = found === undefined ? null : frameBody(found, version);
    if (body === null) return null;
    const values = textValues(body);
    return values.length === 0 ? null : values.join(", ");
  }
  const pictures = frames
    .filter((candidate) => candidate.id === "APIC")
    .flatMap((candidate) => pictureOf(candidate, version) ?? []);
  const cover = pictures.find((picture) => picture.type === 3) ?? pictures[0];
  return {
    artwork: cover === undefined || cover.data.length === 0 ? null : cover.data,
    tags: {
      album: text("TALB"),
      albumArtist: text("TPE2"),
      artist: text("TPE1"),
      compilation: isCompilation(frames, version),
      title: text("TIT2"),
      track: text("TRCK"),
      year: text("TDRC") ?? text("TYER"),
    },
  } satisfies EmbeddedTags;
}

function textFrame(id: string, text: string, version: 3 | 4) {
  // 2.4: UTF-8 (encoding 3). 2.3: UTF-16 with a byte order mark (1).
  const body =
    version === 4
      ? concatBytes([Uint8Array.of(3), utf8Bytes(text)])
      : concatBytes([Uint8Array.of(1), utf16Bytes(text)]);
  return frame(id, body, version);
}

function pictureFrame(jpeg: Uint8Array, description: string, version: 3 | 4) {
  // Latin-1 MIME type, picture type 3 (front cover), then its description.
  const body = concatBytes([
    Uint8Array.of(0),
    latin1Bytes("image/jpeg"),
    Uint8Array.of(0, 3),
    latin1Bytes(description),
    Uint8Array.of(0),
    jpeg,
  ]);
  return frame("APIC", body, version);
}

function joined(names: readonly string[]) {
  return names.length === 0 ? null : names.join(", ");
}

/** The number in the first of these frames, like the 2019 of "2019-05-01"; null when unreadable. */
function frameNumber(
  frames: readonly Id3Frame[],
  ids: readonly string[],
  version: 3 | 4,
) {
  const first = new Map<string, Id3Frame>();
  for (const candidate of frames) {
    if (!first.has(candidate.id)) first.set(candidate.id, candidate);
  }
  const found = ids.flatMap((id) => first.get(id) ?? [])[0];
  const body = found === undefined ? null : frameBody(found, version);
  return body === null ? null : firstNumber(textValues(body)[0]);
}

/**
 * Which of the file's frames an export keeps. A date or track that still says
 * what the library says stays as it was, so "2021-05-04" and "3/12" don't
 * shrink to "2021" and "3" just because a title changed.
 */
function keptFrames(
  frames: readonly Id3Frame[],
  tags: SongTags,
  version: 3 | 4,
) {
  const sameYear =
    tags.year !== null &&
    frameNumber(frames, ["TDRC", "TYER"], version) === tags.year;
  const sameTrack =
    tags.track !== null &&
    frameNumber(frames, ["TRCK"], version) === tags.track;
  const kept = frames.filter(({ bytes, id }) => {
    if (id === "TRCK") return sameTrack;
    if (OWN_FRAMES.has(id)) return false;
    if (YEAR_FRAMES.has(id)) return sameYear;
    if (id !== "APIC" || tags.artwork === null) return true;
    const picture = pictureOf({ bytes, id }, version);
    return picture !== null && !COVER_TYPES.has(picture.type);
  });
  return { kept, sameTrack, sameYear };
}

/** SYNQ's frames for `tags`. */
function ownFrames(
  tags: SongTags,
  version: 3 | 4,
  { sameTrack, sameYear }: { sameTrack: boolean; sameYear: boolean },
) {
  const year = tags.year === null || sameYear ? null : String(tags.year);
  const track = tags.track === null || sameTrack ? null : String(tags.track);
  const text = [
    ["TIT2", tags.title === "" ? null : tags.title],
    ["TPE1", joined(tags.artists)],
    ["TPE2", joined(tags.albumArtists)],
    ["TALB", tags.album === "" ? null : tags.album],
    [version === 4 ? "TDRC" : "TYER", year],
    ["TRCK", track],
  ] as const;
  return text.flatMap(([id, value]) =>
    value === null ? [] : [textFrame(id, value, version)],
  );
}

/**
 * A complete ID3v2 tag for `tags`, keeping `existing`'s other frames. The
 * file's own artwork stays unless `tags.artwork` replaces it; other kinds of
 * picture (a back cover) stay either way, after the new cover, since players
 * show the first.
 */
export function buildId3Tag(tags: SongTags, existing: Uint8Array | null) {
  const parsed = existing === null ? null : parseId3Frames(existing);
  const version = parsed?.version ?? 3;
  const { kept, ...same } = keptFrames(parsed?.frames ?? [], tags, version);
  // Two pictures may not share a description, and some readers keep just one.
  const descriptionTaken = kept.some(
    (candidate) =>
      candidate.id === "APIC" &&
      pictureOf(candidate, version)?.description === "",
  );
  const frames = concatBytes([
    ...ownFrames(tags, version, same),
    ...(tags.artwork === null
      ? []
      : [
          pictureFrame(
            tags.artwork,
            descriptionTaken ? "Front Cover" : "",
            version,
          ),
        ]),
    ...kept.map((kept_) => kept_.bytes),
  ]);
  if (frames.length + PADDING >= MAX_TAG_SIZE) {
    throw new RangeError("This tag is too large for ID3.");
  }
  const header = concatBytes([
    latin1Bytes("ID3"),
    Uint8Array.of(version, 0, 0),
    toSyncsafe(frames.length + PADDING),
  ]);
  return concatBytes([header, frames, new Uint8Array(PADDING)]);
}
