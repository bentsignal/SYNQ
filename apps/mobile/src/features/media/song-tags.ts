/** What an export writes into a file, from the library. */
export interface SongTags {
  title: string;
  /** Written as one value joined with ", ", which import splits again. */
  artists: readonly string[];
  album: string | null;
  /** The album's artists: TPE2, `aART`, ALBUMARTIST. Joined like `artists`. */
  albumArtists: readonly string[];
  year: number | null;
  track: number | null;
  /** The cover as JPEG bytes, or null to keep the file's own. */
  artwork: Uint8Array | null;
}

/** Tags read from a file at import, before cleaning. */
export interface RawTags {
  title: string | null;
  artist: string | null;
  album: string | null;
  albumArtist: string | null;
  /** The file says it's part of a compilation (TCMP, `cpil`, COMPILATION). */
  compilation: boolean;
  year: string | null;
  track: string | null;
}

/** Tags SYNQ read from the file itself, and its front cover. */
export interface EmbeddedTags {
  tags: RawTags;
  artwork: Uint8Array | null;
}
