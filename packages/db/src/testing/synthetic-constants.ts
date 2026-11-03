export const BUNDLE_ID = "com.directedbyshawn.synq";

export interface SyntheticInstall {
  /** The app container (parent of `Documents/` and `Library/`). */
  container: string;
  documents: string;
  asyncStorageDir: string;
  dbPath: string;
}

/** Cover mtimes (seconds) → the `artwork_version` (ms) the importer should record. */
export const COVER_MTIMES = {
  song3: 1_700_000_001,
  song6: 1_700_000_002,
  album1: 1_700_000_003,
  album6: 1_700_000_004,
  album4: 1_700_000_005,
  artist3: 1_700_000_006,
  playlist2: 1_700_000_007,
  playlist3: 1_700_000_008,
} as const;

/** `Café del Mar.mp3` as APFS stores a name typed with a combining accent (NFD). */
export const NFD_FILE_NAME = "Café del Mar.mp3";
