/**
 * The tag code's view of a file, so that it runs the same in the app (through
 * a file handle) and in tests and scripts (over a buffer), and never needs the
 * whole of an audio file in memory.
 */
export interface ByteSource {
  size: number;
  /** Up to `length` bytes from `offset`; fewer at the end of the file. */
  read: (offset: number, length: number) => Uint8Array;
}

/** Bytes to overwrite in a copy; an offset at its end extends it. */
export interface RetagPatch {
  offset: number;
  bytes: Uint8Array;
}

/** A source over bytes in memory. */
export function bytesSource(bytes: Uint8Array) {
  return {
    read: (offset: number, length: number) =>
      bytes.subarray(offset, offset + length),
    size: bytes.length,
  } satisfies ByteSource;
}
