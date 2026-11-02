/**
 * Readable file names for what an export writes. A zip can land on any
 * computer, so names avoid what Windows and macOS each refuse, not only
 * what iOS does.
 */

/** Long enough for any real title, short of the file system's 255 bytes. */
const MAX_NAME_LENGTH = 120;

/** A file or zip name from a title: safe everywhere, and never empty. */
export function cleanName(name: string) {
  const cleaned = Array.from(
    name
      .replace(/[\p{Cc}/\\:*?"<>|]/gu, "_")
      .trim()
      .replace(/^\.+/, ""),
  )
    .slice(0, MAX_NAME_LENGTH)
    .join("")
    .trim()
    .replace(/\.+$/, "");
  return cleaned === "" ? "Untitled" : cleaned;
}

/** "Song.mp3" as `Song` and `.mp3`; a name with no extension has "". */
export function splitExtension(name: string) {
  const dot = name.lastIndexOf(".");
  return dot > 0
    ? { extension: name.slice(dot), stem: name.slice(0, dot) }
    : { extension: "", stem: name };
}

/** A song's title as a file name, with its audio file's extension. */
export function titleFileName(title: string, audioFileName: string) {
  return `${cleanName(title)}${splitExtension(audioFileName).extension}`;
}

/**
 * "03 Title.mp3": numbered by place in the export rather than by tag, so
 * sorting by name always gives the order the album or playlist plays in,
 * whatever its tags hold (none, duplicates, a second disc).
 */
export function trackFileName(
  title: string,
  audioFileName: string,
  index: number,
  count: number,
) {
  const width = Math.max(2, String(count).length);
  const number = String(index + 1).padStart(width, "0");
  return `${number} ${titleFileName(title, audioFileName)}`;
}
