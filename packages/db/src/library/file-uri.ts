/**
 * A relative path's segments, encoded for a file URI: everything but plain
 * letters, numbers, and a few marks, so nothing downstream sees a character it
 * would "repair". See `documentFile` in `expo.ts`.
 */
export function encodedPath(relativePath: string) {
  return relativePath
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
}
