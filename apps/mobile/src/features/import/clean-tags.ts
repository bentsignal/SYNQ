import type { RawTags } from "../media/song-tags.ts";

/** The audio SYNQ imports, by extension, with the MIME type it stores. */
export const AUDIO_TYPES = {
  aac: "audio/aac",
  flac: "audio/flac",
  m4a: "audio/mp4",
  mp3: "audio/mpeg",
  wav: "audio/wav",
} as const;

export type AudioExtension = keyof typeof AUDIO_TYPES;

/** What the document picker offers (2.5.2's list, plus m4a's own type). */
export const PICKER_TYPES = [
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/flac",
  "audio/x-flac",
  "audio/wav",
  "audio/x-wav",
];

export function audioExtension(fileName: string) {
  const match = /\.([a-z0-9]+)$/i.exec(fileName);
  const extension = match?.[1]?.toLowerCase();
  return extension !== undefined && extension in AUDIO_TYPES
    ? // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Checked against AUDIO_TYPES' keys on this line.
      (extension as AudioExtension)
    : null;
}

/** The stored MIME type: by extension, which browsers and pickers vary on. */
export function audioMimeType(fileName: string, reported: string | null) {
  const extension = audioExtension(fileName);
  return extension === null ? reported : AUDIO_TYPES[extension];
}

/**
 * 2.5.2's track prefix: two digits and a space ("03 Song"). Returns the
 * track and the text after the prefix.
 */
export function splitTrackPrefix(text: string) {
  if (text.length < 3 || text[2] !== " ") return { track: null, rest: text };
  const track = Number.parseInt(text.slice(0, 2), 10);
  return Number.isNaN(track)
    ? { track: null, rest: text }
    : { track, rest: text.slice(3) };
}

/** "2019", "2019-05-01", "2019-05-01T07:00:00Z" → 2019. */
export function parseYear(value: string | null) {
  const match = value === null ? null : /^\s*(\d{4})/.exec(value);
  const year = match?.[1] === undefined ? 0 : Number(match[1]);
  return year >= 1000 ? year : null;
}

/** "3", "03", "3/12" → 3. */
export function parseTrack(value: string | null) {
  const match = value === null ? null : /^\s*(\d+)/.exec(value);
  const track = match?.[1] === undefined ? 0 : Number(match[1]);
  return track > 0 && track < 10000 ? track : null;
}

function present(value: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}

function stripExtension(fileName: string) {
  return fileName.replace(/\.[a-z0-9]+$/i, "");
}

/**
 * A file's tags as SYNQ imports them, following 2.5.2: a "NN " prefix on
 * the file name or title gives the track number (the title loses it), and
 * a track tag wins over both. Without a title tag, the file name (without
 * its extension) is the title.
 */
export function cleanTags(fileName: string, raw: RawTags) {
  const fromName = splitTrackPrefix(stripExtension(fileName).trim());
  const tagTitle = present(raw.title);
  const fromTitle = tagTitle === null ? null : splitTrackPrefix(tagTitle);
  const title = (fromTitle?.rest ?? fromName.rest).trim();
  return {
    title: title === "" ? stripExtension(fileName).trim() : title,
    artists: present(raw.artist),
    album: present(raw.album),
    year: parseYear(raw.year),
    track: parseTrack(raw.track) ?? fromTitle?.track ?? fromName.track ?? null,
  };
}
