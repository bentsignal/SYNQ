import type { SongTags } from "./song-tags.ts";
import { latin1Bytes, latin1Text } from "./bytes.ts";

/**
 * ID3v1: 128 bytes at the very end of a file. An export can't remove one, so
 * it rewrites it, leaving a player that still reads it nothing stale.
 */

/** Bytes of an ID3v1 tag, the last in a file. */
export const ID3V1_LENGTH = 128;

export function isId3v1(tail: Uint8Array) {
  return (
    tail.length === ID3V1_LENGTH && latin1Text(tail.subarray(0, 3)) === "TAG"
  );
}

/** Latin-1 text in a fixed field: what can't be written is left out. */
function v1Field(text: string | null, length: number) {
  const field = new Uint8Array(length);
  const latin1 = [...(text ?? "").normalize("NFC")].filter(
    (char) => (char.codePointAt(0) ?? 0xffff) <= 0xff,
  );
  const value = latin1Bytes(latin1.join("").trimEnd().slice(0, length));
  field.set(value);
  return field;
}

/**
 * `tail`, an ID3v1 tag, updated to say what `tags` say, so a player that
 * still reads it doesn't show the old ones. It keeps its comment and genre.
 */
export function updateId3v1(tail: Uint8Array, tags: SongTags) {
  const out = tail.slice();
  out.set(v1Field(tags.title, 30), 3);
  out.set(v1Field(tags.artists.join(", "), 30), 33);
  out.set(v1Field(tags.album, 30), 63);
  out.set(v1Field(tags.year === null ? null : String(tags.year), 4), 93);
  if (tags.track !== null && tags.track > 0 && tags.track <= 255) {
    // ID3v1.1: the comment's last two bytes hold a zero and the track.
    out[125] = 0;
    out[126] = tags.track;
  } else if (out[125] === 0) {
    out[126] = 0;
  }
  return out;
}
