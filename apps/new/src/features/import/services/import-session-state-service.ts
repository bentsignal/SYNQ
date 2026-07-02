import type {
  ImportSaveSummary,
  ImportSessionState,
  ImportSongDraft,
} from "../types/import-session";

export type ImportSessionAction =
  | { type: "begin-file-pick" }
  | { total: number; type: "begin-wifi-transfer" }
  | { error: string; type: "fail" }
  | { songs: ImportSongDraft[]; type: "review" }
  | { song: ImportSongDraft; type: "receive-wifi-song" }
  | { songIds: number[]; type: "remove-songs" }
  | { shouldSaveToLibrary: boolean; type: "set-save-to-library" }
  | { song: ImportSongDraft; type: "update-song" }
  | { summary: ImportSaveSummary; type: "finish" }
  | { state: ImportSessionState; type: "hydrate" }
  | { type: "saving" }
  | { type: "discard" }
  | { type: "reset" };

export const initialImportSessionState: ImportSessionState = {
  error: null,
  phase: "idle",
  progress: {
    current: 0,
    total: 0,
  },
  saveSummary: null,
  selectedSongId: null,
  shouldSaveToLibrary: true,
  songs: [],
  source: "files",
};

export const getFinishWifiTransferAction = (
  songs: ImportSongDraft[],
): ImportSessionAction =>
  songs.length > 0
    ? { songs, type: "review" }
    : { error: "No Wi-Fi songs were received.", type: "fail" };

export type ImportSessionCommandMutation =
  | "begin-wifi-transfer"
  | "discard-session"
  | "save-session";

export const getImportSessionCommandErrorMessage = ({
  caughtError,
  mutation,
}: {
  caughtError: unknown;
  mutation: ImportSessionCommandMutation;
}) => {
  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  switch (mutation) {
    case "begin-wifi-transfer":
      return "Wi-Fi import cache could not be prepared.";
    case "discard-session":
      return "Import session could not be discarded.";
    case "save-session":
      return "Import session could not be saved.";
  }
};

export const importSessionReducer = (
  state: ImportSessionState,
  action: ImportSessionAction,
): ImportSessionState => {
  switch (action.type) {
    case "begin-file-pick":
      return {
        ...state,
        error: null,
        phase: "picking",
        source: "files",
      };
    case "begin-wifi-transfer":
      return {
        ...state,
        error: null,
        phase: "processing",
        progress: {
          current: 0,
          total: action.total,
        },
        saveSummary: null,
        selectedSongId: null,
        songs: [],
        source: "wifi",
      };
    case "fail":
      return {
        ...state,
        error: action.error,
        phase: "failure",
      };
    case "receive-wifi-song": {
      const songs = state.songs.some((song) => song.id === action.song.id)
        ? state.songs
        : [...state.songs, action.song];

      return {
        ...state,
        progress: {
          current: songs.length,
          total: Math.max(state.progress.total, songs.length),
        },
        selectedSongId: action.song.id,
        songs,
      };
    }
    case "review":
      return {
        ...state,
        error: null,
        phase: "reviewing",
        progress: {
          current: action.songs.length,
          total: action.songs.length,
        },
        saveSummary: null,
        selectedSongId: action.songs[0]?.id ?? null,
        songs: action.songs,
      };
    case "remove-songs": {
      const songIdSet = new Set(action.songIds);
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
    }
    case "set-save-to-library":
      return {
        ...state,
        shouldSaveToLibrary: action.shouldSaveToLibrary,
      };
    case "update-song":
      return {
        ...state,
        saveSummary: null,
        songs: state.songs.map((song) =>
          song.id === action.song.id ? action.song : song,
        ),
      };
    case "saving":
      return {
        ...state,
        error: null,
        phase: state.shouldSaveToLibrary ? "saving" : "discarding",
        progress: {
          current: 0,
          total: state.songs.length,
        },
      };
    case "finish":
      return {
        ...state,
        error: null,
        phase: "success",
        progress: {
          current: action.summary.saved + action.summary.discarded,
          total: action.summary.saved + action.summary.discarded,
        },
        saveSummary: action.summary,
      };
    case "hydrate":
      return action.state;
    case "discard":
      return {
        ...initialImportSessionState,
        phase: "idle",
      };
    case "reset":
      return initialImportSessionState;
  }
};
