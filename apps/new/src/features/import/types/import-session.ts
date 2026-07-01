export type ImportPhase =
  | "discarding"
  | "failure"
  | "idle"
  | "picking"
  | "processing"
  | "reviewing"
  | "saving"
  | "success";

export type ImportSource = "files" | "wifi";

export type ImportSongDraft = {
  album: string;
  artist: string;
  artwork: string | null;
  cacheUri: string;
  duration: number | null;
  fileName: string;
  fileType: string;
  id: number;
  title: string;
  track: number | null;
};

export type ImportProgress = {
  current: number;
  total: number;
};

export type ImportSessionState = {
  error: string | null;
  phase: ImportPhase;
  progress: ImportProgress;
  saveSummary: ImportSaveSummary | null;
  selectedSongId: number | null;
  shouldSaveToLibrary: boolean;
  songs: ImportSongDraft[];
  source: ImportSource;
};

export type ImportSaveSummary = {
  discarded: number;
  saved: number;
  savedSongIds: number[];
};
