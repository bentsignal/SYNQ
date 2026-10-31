const mimeExtensions = new Map([
  ["audio/mpeg", "mp3"],
  ["audio/mp3", "mp3"],
  ["audio/mp4", "m4a"],
  ["audio/x-m4a", "m4a"],
  ["audio/aac", "aac"],
  ["audio/wav", "wav"],
  ["audio/x-wav", "wav"],
  ["audio/flac", "flac"],
]);

/**
 * A file name that is safe as one path component. 2.5.2 built
 * `song.${mimeType}` for nameless imports, which produced `song.audio/mpeg`
 * (a subdirectory); this never emits a slash.
 */
export function safeFileName(fileName: string, mimeType?: string | null) {
  const cleaned = fileName
    .normalize("NFC")
    .replace(/[/\\\0]/g, "_")
    .trim();
  if (cleaned !== "" && cleaned !== "." && cleaned !== "..") return cleaned;
  const extension =
    (mimeType && mimeExtensions.get(mimeType.toLowerCase())) ?? "audio";
  return `song.${extension}`;
}
