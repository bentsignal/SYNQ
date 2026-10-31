/** What an export writes into a file, from the library. */
export interface SongTags {
  title: string;
  /** Written as one value joined with ", ", which import splits again. */
  artists: readonly string[];
  album: string | null;
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
  year: string | null;
  track: string | null;
}
