import type { File } from "expo-file-system";
import { FileMode } from "expo-file-system";

import type { ByteSource, RetagPatch } from "./byte-source";

/** Runs `read` with a file as a `ByteSource`, read-only, then closes the handle. */
export function withFileSource<Value>(
  file: File,
  read: (source: ByteSource) => Value,
) {
  const handle = file.open(FileMode.ReadOnly);
  try {
    const value = read({
      read: (offset, length) => {
        handle.offset = offset;
        return handle.readBytes(length);
      },
      size: file.size,
    });
    handle.close();
    return value;
  } catch (error) {
    handle.close();
    throw error;
  }
}

/** Overwrites bytes in a copy; an offset at its end extends it. */
export function applyPatches(file: File, patches: readonly RetagPatch[]) {
  if (patches.length === 0) return;
  const handle = file.open(FileMode.ReadWrite);
  try {
    for (const { bytes, offset } of patches) {
      handle.offset = offset;
      handle.writeBytes(bytes);
    }
    handle.close();
  } catch (error) {
    handle.close();
    throw error;
  }
}
