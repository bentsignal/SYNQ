/**
 * A minimal zip extractor for tests: enough for 2.5.2's backup archives
 * (stored or deflated entries, UTF-8 names, data descriptors). Sizes and
 * offsets come from the central directory, since 2.5.2's zips leave them
 * zero in the local headers. Names are written byte-for-byte, so an NFD
 * name in the archive stays NFD on disk.
 */
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, normalize, sep } from "node:path";
import { inflateRawSync } from "node:zlib";

const END_OF_CENTRAL_DIRECTORY = 0x06054b50;
const CENTRAL_FILE_HEADER = 0x02014b50;
const LOCAL_FILE_HEADER = 0x04034b50;

function findEndOfCentralDirectory(zip: Buffer) {
  // The record is 22 bytes plus a comment of at most 64 KiB.
  for (let at = zip.length - 22; at >= Math.max(0, zip.length - 65_557); at--) {
    if (zip.readUInt32LE(at) === END_OF_CENTRAL_DIRECTORY) return at;
  }
  throw new Error("not a zip archive (no end of central directory)");
}

function readEntries(zip: Buffer) {
  const end = findEndOfCentralDirectory(zip);
  const count = zip.readUInt16LE(end + 10);
  let at = zip.readUInt32LE(end + 16);
  const entries = new Array<{
    name: Buffer;
    method: number;
    compressedSize: number;
    localHeader: number;
  }>();
  for (let index = 0; index < count; index++) {
    if (zip.readUInt32LE(at) !== CENTRAL_FILE_HEADER)
      throw new Error(`bad central directory entry ${index}`);
    const nameLength = zip.readUInt16LE(at + 28);
    const extraLength = zip.readUInt16LE(at + 30);
    const commentLength = zip.readUInt16LE(at + 32);
    entries.push({
      method: zip.readUInt16LE(at + 10),
      compressedSize: zip.readUInt32LE(at + 20),
      localHeader: zip.readUInt32LE(at + 42),
      name: zip.subarray(at + 46, at + 46 + nameLength),
    });
    at += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

/** Extracts `zipPath` into a new temporary folder and returns its path. */
export function extractZip(zipPath: string) {
  const zip = readFileSync(zipPath);
  const target = mkdtempSync(join(tmpdir(), "synq-unzip-"));
  for (const entry of readEntries(zip)) {
    const name = entry.name.toString("utf8");
    const path = normalize(join(target, name));
    if (!path.startsWith(target + sep))
      throw new Error(`entry escapes the folder: ${name}`);
    if (name.endsWith("/")) {
      mkdirSync(path, { recursive: true });
      continue;
    }
    const local = entry.localHeader;
    if (zip.readUInt32LE(local) !== LOCAL_FILE_HEADER)
      throw new Error(`bad local header for ${name}`);
    const start =
      local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
    const data = zip.subarray(start, start + entry.compressedSize);
    if (entry.method !== 0 && entry.method !== 8)
      throw new Error(`unsupported compression ${entry.method} for ${name}`);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, entry.method === 8 ? inflateRawSync(data) : data);
  }
  return target;
}
