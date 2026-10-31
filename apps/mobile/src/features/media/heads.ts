import type { File } from "expo-file-system";

import type { FlacBlock } from "./flac";
import { latin1Text } from "./bytes";
import {
  FLAC_BLOCK_HEADER_LENGTH,
  FLAC_MARKER,
  parseFlacBlockHeader,
} from "./flac";
import { ID3_HEADER_LENGTH, id3TagLength } from "./id3";

/**
 * Reading the tag block at the start of an audio file through a file
 * handle, without reading the audio.
 */

/** The file's ID3v2 tag, or null when it has none. */
export function readId3Tag(file: File) {
  const handle = file.open();
  let tag: Uint8Array | null = null;
  try {
    const header = handle.readBytes(ID3_HEADER_LENGTH);
    const length = id3TagLength(header);
    if (length > 0) {
      handle.offset = 0;
      tag = handle.readBytes(length);
      if (tag.length < length) tag = null;
    }
  } catch {
    tag = null;
  }
  handle.close();
  return tag;
}

/**
 * FLAC's metadata blocks (and where the audio starts), read from the start
 * of the file without reading the audio.
 */
export function readFlacBlocks(file: File) {
  const handle = file.open();
  const blocks: FlacBlock[] = [];
  let end = 0;
  try {
    let start = handle.readBytes(ID3_HEADER_LENGTH);
    // Some taggers put an ID3 tag in front of FLAC; skip it.
    const skip = id3TagLength(start);
    if (skip > 0) {
      handle.offset = skip;
      start = handle.readBytes(4);
    }
    if (latin1Text(start.subarray(0, 4)) === FLAC_MARKER) {
      handle.offset = skip + 4;
      for (;;) {
        const header = parseFlacBlockHeader(
          handle.readBytes(FLAC_BLOCK_HEADER_LENGTH),
        );
        const body = handle.readBytes(header.length);
        if (body.length < header.length) throw new Error("Truncated FLAC.");
        blocks.push({ type: header.type, body });
        if (header.last) break;
      }
      end = handle.offset ?? 0;
    }
  } catch {
    blocks.length = 0;
    end = 0;
  }
  handle.close();
  return { blocks, end };
}

