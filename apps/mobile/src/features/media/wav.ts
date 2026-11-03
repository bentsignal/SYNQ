import type { ByteSource, RetagPatch } from "./byte-source.ts";
import type { EmbeddedTags, SongTags } from "./song-tags.ts";
import {
  concatBytes,
  latin1Bytes,
  latin1Text,
  readUint32LE,
  uint32LE,
  utf8Bytes,
  utf8Text,
} from "./bytes.ts";
import { buildId3Tag, readId3Tags } from "./id3.ts";

/**
 * WAV: RIFF chunks. Tags live in an `id3 ` chunk (what AVFoundation and most
 * players read, with the artwork) and a `LIST` `INFO` chunk (what Windows
 * reads, and all that some writers leave). An export writes both ahead of the
 * audio. Any such chunk after the audio is renamed `JUNK` in the copy, which
 * every reader skips, since the audio's bytes never get read into memory.
 */

const CHUNK_HEADER = 8;
const RIFF_HEADER = 12;
const MAX_RIFF_SIZE = 0xffffffff;
/** What's ahead of the audio is headers; more than this isn't a normal file. */
const MAX_HEAD = 1 << 24;

/** INFO's fields for what SYNQ writes, in the order they're written. */
const OWN_INFO = new Set(["INAM", "IART", "IPRD", "ICRD", "ITRK"]);

interface Chunk {
  id: string;
  offset: number;
  /** The content's size, without the header or the pad byte. */
  size: number;
}

function paddedSize(size: number) {
  return size + (size % 2);
}

/** The file's chunks, with `data` found; null when they don't add up. */
function readChunks(source: ByteSource) {
  const header = source.read(0, RIFF_HEADER);
  if (
    latin1Text(header.subarray(0, 4)) !== "RIFF" ||
    latin1Text(header.subarray(8, 12)) !== "WAVE"
  ) {
    return null;
  }
  const chunks = new Array<Chunk>();
  let offset = RIFF_HEADER;
  while (offset + CHUNK_HEADER <= source.size) {
    const bytes = source.read(offset, CHUNK_HEADER);
    const size = readUint32LE(bytes, 4);
    if (offset + CHUNK_HEADER + size > source.size) return null;
    chunks.push({ id: latin1Text(bytes.subarray(0, 4)), offset, size });
    offset += CHUNK_HEADER + paddedSize(size);
  }
  return chunks.some((chunk) => chunk.id === "data") ? chunks : null;
}

function contentOf(source: ByteSource, chunk: Chunk) {
  return source.read(chunk.offset + CHUNK_HEADER, chunk.size);
}

function chunkBytes(id: string, content: Uint8Array) {
  return concatBytes([
    latin1Bytes(id),
    uint32LE(content.length),
    content,
    new Uint8Array(content.length % 2),
  ]);
}

function isId3Chunk(chunk: Chunk) {
  return chunk.id.toLowerCase() === "id3 ";
}

function isInfoChunk(source: ByteSource, chunk: Chunk) {
  return (
    chunk.id === "LIST" &&
    latin1Text(source.read(chunk.offset + CHUNK_HEADER, 4)) === "INFO"
  );
}

/** A `LIST` `INFO` chunk's fields: their ids and raw values. */
function infoFields(content: Uint8Array) {
  const fields = new Array<{ id: string; value: Uint8Array }>();
  let offset = 4;
  while (offset + CHUNK_HEADER <= content.length) {
    const size = readUint32LE(content, offset + 4);
    fields.push({
      id: latin1Text(content.subarray(offset, offset + 4)),
      value: content.subarray(
        offset + CHUNK_HEADER,
        offset + CHUNK_HEADER + size,
      ),
    });
    offset += CHUNK_HEADER + paddedSize(size);
  }
  return fields;
}

/** An INFO value's text, up to its terminator. */
function infoText(value: Uint8Array) {
  const end = value.indexOf(0);
  const text = utf8Text(end === -1 ? value : value.subarray(0, end)).trim();
  return text === "" ? null : text;
}

/** The tags in a WAV's `id3 ` chunk, else its INFO fields, for import. */
export function readWavTags(source: ByteSource) {
  const chunks = readChunks(source);
  if (chunks === null) return null;
  const id3 = chunks.find(isId3Chunk);
  if (id3 !== undefined) {
    const read = readId3Tags(contentOf(source, id3));
    if (read !== null) return read;
  }
  const info = chunks.find((chunk) => isInfoChunk(source, chunk));
  if (info === undefined) return null;
  const fields = infoFields(contentOf(source, info));
  function field(id: string) {
    const found = fields.find((candidate) => candidate.id === id);
    return found === undefined ? null : infoText(found.value);
  }
  return {
    artwork: null,
    tags: {
      album: field("IPRD"),
      albumArtist: null,
      artist: field("IART"),
      compilation: false,
      title: field("INAM"),
      track: field("ITRK") ?? field("IPRT"),
      year: field("ICRD"),
    },
  } satisfies EmbeddedTags;
}

function infoField(id: string, text: string) {
  return chunkBytes(id, concatBytes([utf8Bytes(text), Uint8Array.of(0)]));
}

/** The new INFO chunk: SYNQ's fields, then the file's others (encoder, comment). */
function buildInfo(existing: Uint8Array | null, tags: SongTags) {
  const own = [
    ["INAM", tags.title === "" ? null : tags.title],
    ["IART", tags.artists.length === 0 ? null : tags.artists.join(", ")],
    ["IPRD", tags.album === "" ? null : tags.album],
    ["ICRD", tags.year === null ? null : String(tags.year)],
    ["ITRK", tags.track === null ? null : String(tags.track)],
  ] as const;
  const kept = existing === null ? [] : infoFields(existing);
  return chunkBytes(
    "LIST",
    concatBytes([
      latin1Bytes("INFO"),
      ...own.flatMap(([id, value]) =>
        value === null ? [] : [infoField(id, value)],
      ),
      ...kept
        .filter(({ id }) => !OWN_INFO.has(id))
        .map(({ id, value }) => chunkBytes(id, value)),
    ]),
  );
}

/**
 * What tags a copy of a WAV: a new head, from the RIFF header through the new
 * tag chunks, in place of everything before `data`, and patches for what
 * comes after. Null when the file can't be sized or would outgrow RIFF.
 */
export function planWav(source: ByteSource, tags: SongTags) {
  const chunks = readChunks(source);
  const dataIndex = chunks?.findIndex((chunk) => chunk.id === "data") ?? -1;
  const data = chunks?.[dataIndex];
  if (chunks === null || data === undefined || data.offset > MAX_HEAD) {
    return null;
  }
  function isTag(chunk: Chunk) {
    return isId3Chunk(chunk) || isInfoChunk(source, chunk);
  }
  const existingId3 = chunks.find(isId3Chunk);
  const existingInfo = chunks.find((chunk) => isInfoChunk(source, chunk));
  const before = chunks
    .slice(0, dataIndex)
    .filter((chunk) => !isTag(chunk))
    .map((chunk) =>
      source.read(chunk.offset, CHUNK_HEADER + paddedSize(chunk.size)),
    );
  const body = concatBytes([
    ...before,
    buildInfo(
      existingInfo === undefined ? null : contentOf(source, existingInfo),
      tags,
    ),
    chunkBytes(
      "id3 ",
      buildId3Tag(
        tags,
        existingId3 === undefined ? null : contentOf(source, existingId3),
      ),
    ),
  ]);
  const riffSize =
    latin1Bytes("WAVE").length + body.length + (source.size - data.offset);
  if (riffSize > MAX_RIFF_SIZE) return null;
  const head = concatBytes([
    latin1Bytes("RIFF"),
    uint32LE(riffSize),
    latin1Bytes("WAVE"),
    body,
  ]);
  const shift = head.length - data.offset;
  const patches = chunks
    .slice(dataIndex + 1)
    .filter(isTag)
    .map((chunk) => ({
      bytes: latin1Bytes("JUNK"),
      offset: chunk.offset + shift,
    })) satisfies RetagPatch[];
  return { head, patches, skip: data.offset };
}
