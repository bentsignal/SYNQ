import type { File, FileHandle } from "expo-file-system";

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

/** `run`'s result, or `fallback` if it throws (a short or unreadable file). */
function attempt<Value>(run: () => Value, fallback: Value) {
  try {
    return run();
  } catch {
    return fallback;
  }
}

/** The file's ID3v2 tag, or null when it has none. */
export function readId3Tag(file: File) {
  const handle = file.open();
  const tag = attempt(() => {
    const length = id3TagLength(handle.readBytes(ID3_HEADER_LENGTH));
    if (length === 0) return null;
    handle.offset = 0;
    const bytes = handle.readBytes(length);
    return bytes.length < length ? null : bytes;
  }, null);
  handle.close();
  return tag;
}

/** The metadata blocks after `fLaC` at `start`, and where the audio begins. */
function readBlocks(handle: FileHandle, start: number) {
  const blocks = new Array<FlacBlock>();
  let end = start;
  handle.offset = start;
  for (;;) {
    const header = parseFlacBlockHeader(handle.readBytes(FLAC_BLOCK_HEADER_LENGTH));
    const body = handle.readBytes(header.length);
    if (body.length < header.length) throw new Error("Truncated FLAC.");
    blocks.push({ body, type: header.type });
    end += FLAC_BLOCK_HEADER_LENGTH + header.length;
    if (header.last) return { blocks, end };
  }
}

/**
 * FLAC's metadata blocks (and where the audio starts), read from the start
 * of the file without reading the audio. Empty when it isn't FLAC.
 */
export function readFlacBlocks(file: File) {
  const handle = file.open();
  const result = attempt(
    () => {
      // Some taggers put an ID3 tag in front of FLAC; skip it.
      const skip = id3TagLength(handle.readBytes(ID3_HEADER_LENGTH));
      handle.offset = skip;
      if (latin1Text(handle.readBytes(4)) !== FLAC_MARKER) {
        return { blocks: [], end: 0 };
      }
      return readBlocks(handle, skip + 4);
    },
    { blocks: new Array<FlacBlock>(), end: 0 },
  );
  handle.close();
  return result;
}
