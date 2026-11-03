import {
  concatBytes,
  latin1Bytes,
  latin1Text,
  readUint32BE,
  uint32BE,
} from "./bytes.ts";

/**
 * Finding the frames in an ID3v2 tag, in any of its versions and shapes.
 * `id3.ts` reads and writes what's in them.
 */

/** Bytes to read from the start of a file to size its tag. */
export const ID3_HEADER_LENGTH = 10;

const FLAG = { unsynchronised: 0x80, extended: 0x40, footer: 0x10 } as const;

export interface Id3Frame {
  id: string;
  /** The whole frame: header and body, as found. */
  bytes: Uint8Array;
}

/** A 2.2 frame's 2.3 name; one not listed has no modern meaning and is dropped. */
const FRAMES_22 = new Map(
  Object.entries({
    BUF: "RBUF",
    CNT: "PCNT",
    COM: "COMM",
    CRA: "AENC",
    ETC: "ETCO",
    GEO: "GEOB",
    IPL: "IPLS",
    LNK: "LINK",
    MCI: "MCDI",
    MLL: "MLLT",
    POP: "POPM",
    REV: "RVRB",
    SLT: "SYLT",
    STC: "SYTC",
    TAL: "TALB",
    TBP: "TBPM",
    TCM: "TCOM",
    TCO: "TCON",
    TCP: "TCMP",
    TCR: "TCOP",
    TDA: "TDAT",
    TDY: "TDLY",
    TEN: "TENC",
    TFT: "TFLT",
    TIM: "TIME",
    TKE: "TKEY",
    TLA: "TLAN",
    TLE: "TLEN",
    TMT: "TMED",
    TOA: "TOPE",
    TOF: "TOFN",
    TOL: "TOLY",
    TOR: "TORY",
    TOT: "TOAL",
    TP1: "TPE1",
    TP2: "TPE2",
    TP3: "TPE3",
    TP4: "TPE4",
    TPA: "TPOS",
    TPB: "TPUB",
    TRC: "TSRC",
    TRD: "TRDA",
    TRK: "TRCK",
    TSI: "TSIZ",
    TSS: "TSSE",
    TT1: "TIT1",
    TT2: "TIT2",
    TT3: "TIT3",
    TXT: "TEXT",
    TXX: "TXXX",
    TYE: "TYER",
    UFI: "UFID",
    ULT: "USLT",
    WAF: "WOAF",
    WAR: "WOAR",
    WAS: "WOAS",
    WCM: "WCOM",
    WCP: "WCOP",
    WPB: "WPUB",
    WXX: "WXXX",
  }),
);

export function syncsafe(bytes: Uint8Array, offset: number) {
  return (
    ((bytes[offset] ?? 0) & 0x7f) * 0x200000 +
    (((bytes[offset + 1] ?? 0) & 0x7f) << 14) +
    (((bytes[offset + 2] ?? 0) & 0x7f) << 7) +
    ((bytes[offset + 3] ?? 0) & 0x7f)
  );
}

export function toSyncsafe(value: number) {
  return Uint8Array.of(
    (value >>> 21) & 0x7f,
    (value >>> 14) & 0x7f,
    (value >>> 7) & 0x7f,
    value & 0x7f,
  );
}

function isId3Header(header: Uint8Array) {
  const version = header[3] ?? 0;
  return (
    header.length >= ID3_HEADER_LENGTH &&
    latin1Text(header.subarray(0, 3)) === "ID3" &&
    version >= 2 &&
    version <= 4 &&
    header[4] !== 0xff &&
    !header.subarray(6, 10).some((byte) => byte >= 0x80)
  );
}

/**
 * The length of the ID3v2 tag at the start of `header` (its first 10 bytes),
 * 0 when there is none. "ID3" alone isn't a tag: audio can start with those
 * bytes, and treating them as one would cut the audio off.
 */
export function id3TagLength(header: Uint8Array) {
  if (!isId3Header(header)) return 0;
  const hasFooter = header[3] === 4 && ((header[5] ?? 0) & FLAG.footer) !== 0;
  return ID3_HEADER_LENGTH + syncsafe(header, 6) + (hasFooter ? 10 : 0);
}

/** Undoes unsynchronisation: every FF 00 becomes FF. */
export function removeUnsync(bytes: Uint8Array) {
  const out = new Uint8Array(bytes.length);
  let length = 0;
  for (let index = 0; index < bytes.length; index++) {
    const byte = bytes[index] ?? 0;
    out[length++] = byte;
    if (byte === 0xff && bytes[index + 1] === 0) index++;
  }
  return out.subarray(0, length);
}

export function frame(id: string, body: Uint8Array, version: 3 | 4) {
  const size = version === 4 ? toSyncsafe(body.length) : uint32BE(body.length);
  return concatBytes([latin1Bytes(id), size, Uint8Array.of(0, 0), body]);
}

/** Whether what's left of a tag holds no more frames. */
function onlyPadding(bytes: Uint8Array, from: number) {
  return (bytes[from] ?? 0) === 0;
}

/**
 * Walks 2.3 or 2.4 frames (a 10-byte header each). `clean` is whether the
 * walk reached the padding or the end, rather than something unreadable.
 * Frames with nothing in them are dropped, not treated as the end.
 */
function walkFrames(
  bytes: Uint8Array,
  start: number,
  readSize: (offset: number) => number,
) {
  const frames = new Array<{ id: string; offset: number; size: number }>();
  let offset = start;
  while (offset + 10 <= bytes.length) {
    if (onlyPadding(bytes, offset)) return { clean: true, frames };
    const id = latin1Text(bytes.subarray(offset, offset + 4));
    const size = readSize(offset + 4);
    if (!/^[A-Z0-9]{4}$/.test(id) || offset + 10 + size > bytes.length) {
      return { clean: false, frames };
    }
    if (size > 0) frames.push({ id, offset, size });
    offset += 10 + size;
  }
  return { clean: true, frames };
}

/** Where a 2.3 or 2.4 tag's frames start: after any extended header. */
function framesStart(body: Uint8Array, version: 3 | 4, flags: number) {
  if ((flags & FLAG.extended) === 0) return 0;
  // The extended header's size excludes itself in 2.3, includes it in 2.4.
  return version === 3 ? readUint32BE(body, 0) + 4 : syncsafe(body, 0);
}

/** 2.3 frames, read through a whole-tag unsynchronisation if there was one. */
function frames23(body: Uint8Array, flags: number) {
  const decoded =
    (flags & FLAG.unsynchronised) !== 0 ? removeUnsync(body) : body;
  return walkFrames(decoded, framesStart(decoded, 3, flags), (offset) =>
    readUint32BE(decoded, offset),
  ).frames.map(({ id, offset, size }) => ({
    bytes: decoded.slice(offset, offset + 10 + size),
    id,
  }));
}

/**
 * 2.4 frames. Each is its own unsynchronised unit, so whole-tag
 * unsynchronisation only needs each frame to say so, since the new header
 * won't. Old iTunes wrote plain sizes instead of syncsafe ones; those parse
 * badly as syncsafe, and are rewritten properly.
 */
function frames24(body: Uint8Array, flags: number) {
  const start = framesStart(body, 4, flags);
  const asSyncsafe = walkFrames(body, start, (offset) =>
    syncsafe(body, offset),
  );
  const asPlain = asSyncsafe.clean
    ? asSyncsafe
    : walkFrames(body, start, (offset) => readUint32BE(body, offset));
  const plainSizes = !asSyncsafe.clean && asPlain.clean;
  const walked = plainSizes ? asPlain : asSyncsafe;
  return walked.frames.map(({ id, offset, size }) => {
    const bytes = body.slice(offset, offset + 10 + size);
    if (plainSizes) bytes.set(toSyncsafe(size), 4);
    if ((flags & FLAG.unsynchronised) !== 0) bytes[9] = (bytes[9] ?? 0) | 0x02;
    return { bytes, id };
  });
}

/** 2.2's PIC has a three-letter format where APIC has a MIME type. */
function picBody(body: Uint8Array) {
  const format = latin1Text(body.subarray(1, 4)).toUpperCase();
  const mime = format === "PNG" ? "image/png" : "image/jpeg";
  return concatBytes([
    body.subarray(0, 1),
    latin1Bytes(mime),
    Uint8Array.of(0),
    body.subarray(4),
  ]);
}

/** The 2.2 frame at `offset`, as a 2.3 one if it has a modern meaning. */
function frame22At(bytes: Uint8Array, offset: number) {
  const name = latin1Text(bytes.subarray(offset, offset + 3));
  const size =
    ((bytes[offset + 3] ?? 0) << 16) +
    ((bytes[offset + 4] ?? 0) << 8) +
    (bytes[offset + 5] ?? 0);
  const next = offset + 6 + size;
  if (!/^[A-Z0-9]{3}$/.test(name) || next > bytes.length) return null;
  const id = name === "PIC" ? "APIC" : FRAMES_22.get(name);
  if (id === undefined || size === 0) return { frame: null, next };
  const content = bytes.subarray(offset + 6, next);
  const body = name === "PIC" ? picBody(content) : content;
  return { frame: { bytes: frame(id, body, 3), id }, next };
}

/** 2.2 frames (six-byte headers), renamed as their 2.3 equivalents. */
function frames22(body: Uint8Array, flags: number) {
  // 2.2's 0x40 flag means compression, with no scheme ever defined.
  if ((flags & 0x40) !== 0) return [];
  const decoded =
    (flags & FLAG.unsynchronised) !== 0 ? removeUnsync(body) : body;
  const frames = new Array<Id3Frame>();
  let offset = 0;
  while (offset + 6 <= decoded.length && decoded[offset] !== 0) {
    const found = frame22At(decoded, offset);
    if (found === null) break;
    if (found.frame !== null) frames.push(found.frame);
    offset = found.next;
  }
  return frames;
}

/**
 * A tag's frames as 2.3 or 2.4 frames, whatever it was: 2.2 is converted.
 * Null when it isn't a tag this can read.
 */
export function parseId3Frames(tag: Uint8Array) {
  const length = id3TagLength(tag);
  if (length === 0) return null;
  const version = tag[3] ?? 0;
  const flags = tag[5] ?? 0;
  const body = tag.subarray(
    ID3_HEADER_LENGTH,
    Math.min(tag.length, ID3_HEADER_LENGTH + syncsafe(tag, 6)),
  );
  if (version === 2)
    return { frames: frames22(body, flags), version: 3 as const };
  if (version === 3)
    return { frames: frames23(body, flags), version: 3 as const };
  return { frames: frames24(body, flags), version: 4 as const };
}
