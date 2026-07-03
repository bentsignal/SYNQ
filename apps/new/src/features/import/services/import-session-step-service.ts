import type {
  ImportSaveSummary,
  ImportSessionState,
  ImportSongDraft,
} from "../types/import-session";
import { initialImportSessionState } from "./import-session-initial-state-service";

export const beginImportFilePick = (
  state: ImportSessionState,
): ImportSessionState => ({
  ...state,
  error: null,
  phase: "picking",
  source: "files",
});

export const beginImportWifiTransfer = ({
  state,
  total,
}: {
  state: ImportSessionState;
  total: number;
}): ImportSessionState => ({
  ...state,
  error: null,
  phase: "processing",
  progress: {
    current: 0,
    total,
  },
  saveSummary: null,
  selectedSongId: null,
  songs: [],
  source: "wifi",
});

export const failImportSession = ({
  error,
  state,
}: {
  error: string;
  state: ImportSessionState;
}): ImportSessionState => ({
  ...state,
  error,
  phase: "failure",
});

export const receiveImportWifiSong = ({
  song,
  state,
}: {
  song: ImportSongDraft;
  state: ImportSessionState;
}): ImportSessionState => {
  const songs = state.songs.some((item) => item.id === song.id)
    ? state.songs
    : [...state.songs, song];

  return {
    ...state,
    progress: {
      current: songs.length,
      total: Math.max(state.progress.total, songs.length),
    },
    selectedSongId: song.id,
    songs,
  };
};

export const reviewImportSongs = ({
  songs,
  state,
}: {
  songs: ImportSongDraft[];
  state: ImportSessionState;
}): ImportSessionState => ({
  ...state,
  error: null,
  phase: "reviewing",
  progress: {
    current: songs.length,
    total: songs.length,
  },
  saveSummary: null,
  selectedSongId: songs[0]?.id ?? null,
  songs,
});

export const removeImportSongs = ({
  songIds,
  state,
}: {
  songIds: number[];
  state: ImportSessionState;
}): ImportSessionState => {
  const songIdSet = new Set(songIds);
  const songs = state.songs.filter((song) => !songIdSet.has(song.id));

  return {
    ...state,
    progress: {
      current: songs.length,
      total: songs.length,
    },
    selectedSongId: songs[0]?.id ?? null,
    songs,
  };
};

export const setImportSaveToLibrary = ({
  shouldSaveToLibrary,
  state,
}: {
  shouldSaveToLibrary: boolean;
  state: ImportSessionState;
}): ImportSessionState => ({
  ...state,
  shouldSaveToLibrary,
});

export const updateImportSong = ({
  song,
  state,
}: {
  song: ImportSongDraft;
  state: ImportSessionState;
}): ImportSessionState => ({
  ...state,
  saveSummary: null,
  songs: state.songs.map((item) => (item.id === song.id ? song : item)),
});

export const startImportSessionSave = (
  state: ImportSessionState,
): ImportSessionState => ({
  ...state,
  error: null,
  phase: state.shouldSaveToLibrary ? "saving" : "discarding",
  progress: {
    current: 0,
    total: state.songs.length,
  },
});

export const finishImportSession = ({
  state,
  summary,
}: {
  state: ImportSessionState;
  summary: ImportSaveSummary;
}): ImportSessionState => {
  const total = summary.saved + summary.discarded;

  return {
    ...state,
    error: null,
    phase: "success",
    progress: {
      current: total,
      total,
    },
    saveSummary: summary,
  };
};

export const discardImportSession = (): ImportSessionState => ({
  ...initialImportSessionState,
  phase: "idle",
});
