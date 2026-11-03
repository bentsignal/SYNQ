import type { ByteSource, RetagPatch } from "./byte-source.ts";
import type { EmbeddedTags, SongTags } from "./song-tags.ts";
import {
  concatBytes,
  firstNumber,
  latin1Bytes,
  latin1Text,
  readUint16BE,
  readUint32BE,
  readUint64BE,
  uint16BE,
  uint32BE,
  utf8Bytes,
  utf8Text,
  utf16Text,
} from "./bytes.ts";

/**
 * iTunes tags in an MPEG-4 file (m4a: AAC or ALAC), the `moov/udta/meta/ilst`
 * atoms. AVFoundation's passthrough export remuxes the whole file, and loses
 * a track total and a full date on the way. This only ever rewrites `moov`,
 * and never moves the audio, so the sample offsets, edit lists, gapless info,
 * and chapters all stay exactly as they were:
 *
 * - The new `moov` goes in the old one's place if it fits, with a `free` atom
 *   taking up what's left.
 * - Otherwise the old one is renamed `free` where it is, and the new one goes
 *   at the end of the file. Every reader finds `moov` wherever it is.
 *
 * Fragmented files, and files whose atoms don't add up, are left to the
 * native tagger (`planMp4` returns null).
 */

const HEADER = 8;
const LARGE_HEADER = 16;

interface Atom {
  type: string;
  /** Where the atom starts, in the bytes or file it was read from. */
  offset: number;
  /** The whole atom, header included. */
  size: number;
  /** Bytes of header before its content. */
  header: number;
}

/** The atom at `offset`, from its header bytes, or null if it can't be one. */
function atomAt(bytes: Uint8Array, offset: number, available: number) {
  if (available < HEADER) return null;
  const type = latin1Text(bytes.subarray(4, 8));
  const declared = readUint32BE(bytes, 0);
  if (declared === 1) {
    if (bytes.length < LARGE_HEADER) return null;
    const size = readUint64BE(bytes, 8);
    if (size < LARGE_HEADER || size > available) return null;
    return { header: LARGE_HEADER, offset, size, type } satisfies Atom;
  }
  // Zero: this atom runs to the end of the file.
  const size = declared === 0 ? available : declared;
  if (size < HEADER || size > available) return null;
  return { header: HEADER, offset, size, type } satisfies Atom;
}

/** The atoms in `bytes` from `start`, stopping at anything that isn't one. */
function childAtoms(bytes: Uint8Array, start = 0) {
  const atoms = new Array<Atom>();
  let offset = start;
  while (offset < bytes.length) {
    const atom = atomAt(
      bytes.subarray(offset, offset + LARGE_HEADER),
      offset,
      bytes.length - offset,
    );
    if (atom === null) break;
    atoms.push(atom);
    offset += atom.size;
  }
  return atoms;
}

function atomBytes(type: string, ...content: readonly Uint8Array[]) {
  const body = concatBytes(content);
  return concatBytes([uint32BE(body.length + HEADER), latin1Bytes(type), body]);
}

function contentOf(bytes: Uint8Array, atom: Atom) {
  return bytes.subarray(atom.offset + atom.header, atom.offset + atom.size);
}

function wholeAtom(bytes: Uint8Array, atom: Atom) {
  return bytes.subarray(atom.offset, atom.offset + atom.size);
}

/** The file's top-level atoms; null if they don't reach the end of the file. */
function topLevelAtoms(source: ByteSource) {
  const atoms = new Array<Atom>();
  let offset = 0;
  while (offset < source.size) {
    const atom = atomAt(
      source.read(offset, LARGE_HEADER),
      offset,
      source.size - offset,
    );
    if (atom === null) return null;
    atoms.push(atom);
    offset += atom.size;
  }
  return atoms;
}

/**
 * `meta` is a full atom (four bytes of version and flags) in iTunes files,
 * and a plain one in QuickTime's: there, `hdlr` follows at once.
 */
function metaChildrenStart(meta: Uint8Array) {
  return latin1Text(meta.subarray(4, 8)) === "hdlr" ? 0 : 4;
}

function findChild(bytes: Uint8Array, type: string, start = 0) {
  return childAtoms(bytes, start).find((atom) => atom.type === type);
}

/** The `ilst` content in a `moov`, or null if it has none. */
function ilstOf(moov: Uint8Array) {
  const udta = findChild(moov, "udta");
  if (udta === undefined) return null;
  const udtaContent = contentOf(moov, udta);
  const meta = findChild(udtaContent, "meta");
  if (meta === undefined) return null;
  const metaContent = contentOf(udtaContent, meta);
  const ilst = findChild(metaContent, "ilst", metaChildrenStart(metaContent));
  return ilst === undefined ? null : contentOf(metaContent, ilst);
}

/** An item's values: the content of each of its `data` atoms, with their type. */
function itemData(item: Uint8Array) {
  return childAtoms(item)
    .filter((atom) => atom.type === "data")
    .map((atom) => {
      const data = contentOf(item, atom);
      return { type: readUint32BE(data, 0), value: data.subarray(8) };
    });
}

function itemText(items: Map<string, Uint8Array>, type: string) {
  const [first] = itemData(items.get(type) ?? new Uint8Array());
  if (first === undefined) return null;
  const text =
    first.type === 2 ? utf16Text(first.value, true) : utf8Text(first.value);
  return text.trim() === "" ? null : text;
}

function ilstItems(ilst: Uint8Array) {
  return new Map(
    childAtoms(ilst).map((atom) => [atom.type, contentOf(ilst, atom)]),
  );
}

/** The number at the start of a `trkn`: two zero bytes, then the track. */
function trackOf(items: Map<string, Uint8Array>) {
  const [first] = itemData(items.get("trkn") ?? new Uint8Array());
  if (first === undefined || first.value.length < 4) return null;
  const track = readUint16BE(first.value, 2);
  return track === 0 ? null : track;
}

/** The moov of a file, or null when there isn't exactly one to read. */
function readMoov(source: ByteSource, atoms: readonly Atom[]) {
  const moovs = atoms.filter((atom) => atom.type === "moov");
  const [moov] = moovs;
  if (moov === undefined || moovs.length > 1) return null;
  const bytes = source.read(moov.offset + moov.header, moov.size - moov.header);
  return bytes.length === moov.size - moov.header
    ? { atom: moov, bytes }
    : null;
}

/** The tags and cover in an MPEG-4 file's iTunes atoms, for import. */
export function readMp4Tags(source: ByteSource) {
  const atoms = topLevelAtoms(source);
  const moov = atoms === null ? null : readMoov(source, atoms);
  const ilst = moov === null ? null : ilstOf(moov.bytes);
  if (ilst === null) return null;
  const items = ilstItems(ilst);
  const track = trackOf(items);
  const compilation = itemData(items.get("cpil") ?? new Uint8Array())[0];
  const cover = itemData(items.get("covr") ?? new Uint8Array())[0];
  return {
    artwork:
      cover === undefined || cover.value.length === 0 ? null : cover.value,
    tags: {
      album: itemText(items, "©alb"),
      albumArtist: itemText(items, "aART"),
      artist: itemText(items, "©ART"),
      compilation: compilation?.value[0] === 1,
      title: itemText(items, "©nam"),
      track: track === null ? null : String(track),
      year: itemText(items, "©day"),
    },
  } satisfies EmbeddedTags;
}

/** An `ilst` item holding one `data` atom: `kind` 1 is UTF-8, 0 raw, 13 JPEG. */
function item(type: string, kind: number, value: Uint8Array) {
  return atomBytes(type, atomBytes("data", uint32BE(kind), uint32BE(0), value));
}

function textItem(type: string, text: string) {
  return item(type, 1, utf8Bytes(text));
}

/** trkn: the track number as a big-endian 16-bit value at offset 2. */
function trackItem(track: number) {
  return item(
    "trkn",
    0,
    concatBytes([uint16BE(0), uint16BE(track), uint16BE(0), uint16BE(0)]),
  );
}

/** SYNQ's text items for `tags`; an item with no value isn't written. */
function ownTextItems(tags: SongTags, sameYear: boolean) {
  const values = [
    ["©nam", tags.title],
    ["©ART", tags.artists.join(", ")],
    ["aART", tags.albumArtists.join(", ")],
    ["©alb", tags.album ?? ""],
    ["©day", tags.year === null || sameYear ? "" : String(tags.year)],
  ] as const;
  return values.flatMap(([type, text]) =>
    text === "" ? [] : [textItem(type, text)],
  );
}

function trackItems(track: number | null) {
  return track !== null && track > 0 && track <= 0xffff
    ? [trackItem(track)]
    : [];
}

/** The items SYNQ's values take the place of, in `tags`. */
function replacedItems(tags: SongTags, sameYear: boolean, sameTrack: boolean) {
  const replaced = new Set(["©nam", "©ART", "aART", "©alb"]);
  if (!sameYear) replaced.add("©day");
  if (!sameTrack) replaced.add("trkn");
  if (tags.artwork !== null) replaced.add("covr");
  return replaced;
}

/** The new `ilst`: SYNQ's items, then every other item byte for byte. */
function buildIlst(ilst: Uint8Array | null, tags: SongTags) {
  const source = ilst ?? new Uint8Array(0);
  const existing = ilstItems(source);
  const sameYear =
    tags.year !== null && firstNumber(itemText(existing, "©day")) === tags.year;
  const sameTrack = tags.track !== null && trackOf(existing) === tags.track;
  const replaced = replacedItems(tags, sameYear, sameTrack);
  const kept = childAtoms(source)
    .filter((atom) => !replaced.has(atom.type))
    .map((atom) => wholeAtom(source, atom));
  const track = sameTrack ? [] : trackItems(tags.track);
  // The cover goes last, as iTunes writes it: ffmpeg treats `covr` as a stream,
  // and applies gapless info (`iTunSMPB`) found after it to that stream.
  const cover = tags.artwork === null ? [] : [item("covr", 13, tags.artwork)];
  return atomBytes(
    "ilst",
    ...ownTextItems(tags, sameYear),
    ...track,
    ...kept,
    ...cover,
  );
}

/** A handler for iTunes metadata, which `meta` must have for `ilst` to count. */
function metadataHandler() {
  return atomBytes(
    "hdlr",
    new Uint8Array(8),
    latin1Bytes("mdir"),
    latin1Bytes("appl"),
    new Uint8Array(9),
  );
}

function buildMeta(meta: Uint8Array | null, ilst: Uint8Array) {
  if (meta === null) {
    return atomBytes("meta", new Uint8Array(4), metadataHandler(), ilst);
  }
  const start = metaChildrenStart(meta);
  const children = childAtoms(meta, start);
  const kept = children
    .filter((atom) => atom.type !== "ilst" && atom.type !== "free")
    .map((atom) => wholeAtom(meta, atom));
  const hasHandler = children.some((atom) => atom.type === "hdlr");
  return atomBytes(
    "meta",
    meta.subarray(0, start),
    ...(hasHandler ? [] : [metadataHandler()]),
    ...kept,
    ilst,
  );
}

function buildMoov(moov: Uint8Array, tags: SongTags) {
  const atoms = childAtoms(moov);
  const udta = atoms.find((atom) => atom.type === "udta");
  const udtaContent = udta === undefined ? null : contentOf(moov, udta);
  const metaAtom =
    udtaContent === null ? undefined : findChild(udtaContent, "meta");
  const meta =
    udtaContent === null || metaAtom === undefined
      ? null
      : contentOf(udtaContent, metaAtom);
  const newMeta = buildMeta(meta, buildIlst(ilstOf(moov), tags));
  const others =
    udtaContent === null
      ? []
      : childAtoms(udtaContent)
          .filter((atom) => atom.type !== "meta")
          .map((atom) => wholeAtom(udtaContent, atom));
  const kept = atoms
    .filter((atom) => atom.type !== "udta")
    .map((atom) => wholeAtom(moov, atom));
  return atomBytes("moov", ...kept, atomBytes("udta", ...others, newMeta));
}

/** The new `moov` where the old one is, if it fits, along with a `free` atom after it. */
function inPlacePatch(atoms: readonly Atom[], moov: Atom, built: Uint8Array) {
  const following = atoms[atoms.indexOf(moov) + 1];
  const room = moov.size + (following?.type === "free" ? following.size : 0);
  const spare = room - built.length;
  if (spare !== 0 && spare < HEADER) return null;
  const filler =
    spare === 0
      ? new Uint8Array(0)
      : atomBytes("free", new Uint8Array(spare - HEADER));
  return { bytes: concatBytes([built, filler]), offset: moov.offset };
}

/** Whether the last atom says it runs to the end of the file, so nothing can follow it. */
function lastAtomRunsToEnd(source: ByteSource, atoms: readonly Atom[]) {
  const last = atoms[atoms.length - 1];
  return (
    last !== undefined &&
    source.read(last.offset, 4).every((byte) => byte === 0)
  );
}

/** Fragments are placed relative to `moov`, and whole-file indexes to the end. */
function isFragmented(atoms: readonly Atom[], moov: Uint8Array) {
  return (
    atoms.some((atom) => atom.type === "moof" || atom.type === "mfra") ||
    findChild(moov, "mvex") !== undefined
  );
}

/**
 * The patches that tag a copy of an MPEG-4 file, or null when this can't do
 * it safely: fragments, atoms that don't add up, or no way to add a new `moov`.
 */
export function planMp4(source: ByteSource, tags: SongTags) {
  const atoms = topLevelAtoms(source);
  const moov = atoms === null ? null : readMoov(source, atoms);
  if (atoms === null || moov === null) return null;
  if (isFragmented(atoms, moov.bytes)) return null;
  const built = buildMoov(moov.bytes, tags);
  const inPlace = inPlacePatch(atoms, moov.atom, built);
  if (inPlace !== null) return [inPlace] satisfies RetagPatch[];
  if (lastAtomRunsToEnd(source, atoms)) return null;
  return [
    { bytes: latin1Bytes("free"), offset: moov.atom.offset + 4 },
    { bytes: built, offset: source.size },
  ] satisfies RetagPatch[];
}
