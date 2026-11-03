import type { ByteSource, RetagPatch } from "./byte-source.ts";
import type { FlacBlock } from "./flac.ts";
import type { SongTags } from "./song-tags.ts";
import { latin1Text } from "./bytes.ts";
import {
  buildFlacHead,
  FLAC_BLOCK_HEADER_LENGTH,
  FLAC_MARKER,
  parseFlacBlockHeader,
  readFlacTags,
} from "./flac.ts";
import {
  buildId3Tag,
  ID3_HEADER_LENGTH,
  id3TagLength,
  readId3Tags,
} from "./id3.ts";
import { ID3V1_LENGTH, isId3v1, updateId3v1 } from "./id3v1.ts";
import { planMp4, readMp4Tags } from "./mp4.ts";
import { planWav, readWavTags } from "./wav.ts";

/**
 * Tags, by what a file is: its bytes decide, not its name, since writing an
 * MP3's ID3 tag ahead of a misnamed M4A would break it. Everything here works
 * on a `ByteSource`, without reading the audio. See docs/audio-tags.md.
 */

export type AudioFormat = "adts" | "flac" | "mp3" | "mp4" | "wav";

/**
 * How to make a tagged copy: `head`, then the source from byte `skip` on,
 * then `patches` over the copy.
 */
export interface RetagPlan {
  format: AudioFormat;
  head: Uint8Array;
  skip: number;
  patches: readonly RetagPatch[];
}

/** Bytes that tell a format from another, after any ID3 tag. */
const SNIFF_LENGTH = 12;

function isMpegSync(bytes: Uint8Array) {
  return bytes[0] === 0xff && ((bytes[1] ?? 0) & 0xe0) === 0xe0;
}

/** ADTS is an MPEG sync with its layer bits zero, which no MP3 frame has. */
function isAdtsSync(bytes: Uint8Array) {
  return bytes[0] === 0xff && ((bytes[1] ?? 0) & 0xf6) === 0xf0;
}

/** Where the ID3v2 tag at the start of a file ends (0 if there is none). */
function leadingTagLength(source: ByteSource) {
  const length = id3TagLength(source.read(0, ID3_HEADER_LENGTH));
  return length > source.size ? 0 : length;
}

/** The format these bytes announce, or null if they say nothing clear. */
function formatByMarker(bytes: Uint8Array) {
  const marker = latin1Text(bytes.subarray(0, 4));
  if (marker === FLAC_MARKER) return "flac";
  if (latin1Text(bytes.subarray(4, 8)) === "ftyp") return "mp4";
  if (marker === "RIFF" && latin1Text(bytes.subarray(8, 12)) === "WAVE") {
    return "wav";
  }
  return null;
}

/**
 * The audio format of a file, from its bytes, or null for one SYNQ has no
 * way to tag (Ogg, AIFF, anything unknown). An MP3 can have junk ahead of its
 * first frame, so a file named .mp3 that isn't anything else counts as one.
 */
export function sniffAudio(source: ByteSource, name: string) {
  const start = leadingTagLength(source);
  const bytes = source.read(start, SNIFF_LENGTH);
  const known = formatByMarker(bytes);
  if (known !== null) return known;
  const marker = latin1Text(bytes.subarray(0, 4));
  if (marker === "OggS" || marker === "FORM") return null;
  if (isAdtsSync(bytes)) return "adts";
  if (isMpegSync(bytes)) return "mp3";
  return /\.mp3$/i.test(name) && start + SNIFF_LENGTH <= source.size
    ? "mp3"
    : null;
}

/** The formats each extension may hold. Others have no say. */
const FORMATS_BY_EXTENSION = new Map<string, readonly AudioFormat[]>([
  ["aac", ["adts", "mp4"]],
  ["flac", ["flac"]],
  ["m4a", ["mp4"]],
  ["m4b", ["mp4"]],
  ["mp3", ["mp3"]],
  ["mp4", ["mp4"]],
  ["wav", ["wav"]],
]);

/**
 * Whether a copy of this format can keep this name. A file whose bytes and
 * extension disagree plays because players look past the name, and tagging it
 * can stop that: Apple reads a .mp3 holding WAV, until it has a tag chunk
 * ahead of its audio. So it's shared as it is.
 */
export function matchesExtension(format: AudioFormat, name: string) {
  const extension = /\.([a-z0-9]+)$/i.exec(name)?.[1]?.toLowerCase() ?? "";
  return FORMATS_BY_EXTENSION.get(extension)?.includes(format) ?? true;
}

function readLeadingTag(source: ByteSource) {
  const length = leadingTagLength(source);
  return length === 0 ? null : source.read(0, length);
}

/** FLAC's metadata blocks, and where its audio starts; null if truncated. */
export function readFlacBlocks(source: ByteSource) {
  let offset = leadingTagLength(source) + FLAC_MARKER.length;
  const blocks = new Array<FlacBlock>();
  for (;;) {
    const header = source.read(offset, FLAC_BLOCK_HEADER_LENGTH);
    if (header.length < FLAC_BLOCK_HEADER_LENGTH) return null;
    const block = parseFlacBlockHeader(header);
    const body = source.read(offset + FLAC_BLOCK_HEADER_LENGTH, block.length);
    if (body.length < block.length) return null;
    blocks.push({ body, type: block.type });
    offset += FLAC_BLOCK_HEADER_LENGTH + block.length;
    if (block.last) return { blocks, end: offset };
  }
}

/** Rewrites what ID3v1 says, if the stream ends with a tag: it can't be removed. */
function id3v1Patches(source: ByteSource, tags: SongTags) {
  const offset = source.size - ID3V1_LENGTH;
  if (offset < 0) return null;
  const tail = source.read(offset, ID3V1_LENGTH);
  return isId3v1(tail) ? { bytes: updateId3v1(tail, tags), offset } : null;
}

function planId3(format: "adts" | "mp3", source: ByteSource, tags: SongTags) {
  const existing = readLeadingTag(source);
  const head = buildId3Tag(tags, existing);
  const skip = existing?.length ?? 0;
  const v1 = id3v1Patches(source, tags);
  return {
    format,
    head,
    patches:
      v1 === null
        ? []
        : [{ bytes: v1.bytes, offset: v1.offset - skip + head.length }],
    skip,
  } satisfies RetagPlan;
}

function planFlac(source: ByteSource, tags: SongTags) {
  const read = readFlacBlocks(source);
  if (read === null) return null;
  return {
    format: "flac",
    head: buildFlacHead(read.blocks, tags),
    patches: [],
    skip: read.end,
  } satisfies RetagPlan;
}

function planWholeMp4(source: ByteSource, tags: SongTags) {
  const patches = planMp4(source, tags);
  if (patches === null) return null;
  return {
    format: "mp4",
    head: new Uint8Array(0),
    patches,
    skip: 0,
  } satisfies RetagPlan;
}

function planWholeWav(source: ByteSource, tags: SongTags) {
  const plan = planWav(source, tags);
  return plan === null
    ? null
    : ({ ...plan, format: "wav" } satisfies RetagPlan);
}

/**
 * How to write `tags` into a copy of a file, or null when SYNQ can't, in
 * which case it's shared as it is (or, for M4A, given to the native tagger).
 * Throws when a value can't fit in the format, with the same result.
 */
export function planRetag(source: ByteSource, name: string, tags: SongTags) {
  const format = sniffAudio(source, name);
  if (format === null || !matchesExtension(format, name)) return null;
  switch (format) {
    case "adts":
    case "mp3":
      return planId3(format, source, tags);
    case "flac":
      return planFlac(source, tags);
    case "mp4":
      return planWholeMp4(source, tags);
    case "wav":
      return planWholeWav(source, tags);
  }
}

function readFlac(source: ByteSource) {
  const read = readFlacBlocks(source);
  return read === null ? null : readFlacTags(read.blocks);
}

function readLeadingId3(source: ByteSource) {
  const tag = readLeadingTag(source);
  return tag === null ? null : readId3Tags(tag);
}

/**
 * The tags and cover SYNQ reads from a file itself, or null to rely on
 * AVFoundation alone. These read more than AVFoundation does: FLAC, ID3v2.2,
 * extended headers, several values in a frame, which picture is the front
 * cover, album artists, and the compilation flag.
 */
export function readEmbeddedTags(source: ByteSource, name: string) {
  switch (sniffAudio(source, name)) {
    case "adts":
    case "mp3":
      return readLeadingId3(source);
    case "flac":
      return readFlac(source);
    case "mp4":
      return readMp4Tags(source);
    case "wav":
      return readWavTags(source);
    case null:
      return null;
  }
}
