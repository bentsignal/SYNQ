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

export const getImportSaveActionState = ({
  isExporting,
  state,
}: {
  isExporting: boolean;
  state: ImportSessionState;
}) => {
  const hasSongs = state.songs.length > 0;
  const isWorking =
    state.phase === "saving" || state.phase === "discarding" || isExporting;

  return {
    canDiscard: !isWorking,
    canExport: hasSongs && !isWorking,
    canFinish: hasSongs && !isWorking,
    discardLabel: "Discard",
    exportLabel: isExporting ? "Exporting" : "Export",
    finishLabel: isWorking ? "Finishing" : "Finish",
    hasSongs,
    isWorking,
  };
};

export const getImportFilesActionState = (state: ImportSessionState) => {
  const isWorking = state.phase === "picking" || state.phase === "processing";

  return {
    chooseLabel: isWorking ? "Choosing" : "Choose songs",
    canChooseFiles: !isWorking,
    isWorking,
  };
};

export const getImportWifiState = ({
  error,
  isReady,
  state,
}: {
  error: string | null;
  isReady: boolean;
  state: ImportSessionState;
}) => {
  const hasSongs = state.songs.length > 0;
  const isTransferring =
    state.source === "wifi" && state.phase === "processing";
  const progressLabel =
    state.progress.total > 0
      ? `${state.progress.current}/${state.progress.total} received`
      : "Waiting";
  const statusLabel = error
    ? "Server failed"
    : isReady
      ? isTransferring
        ? "Receiving files"
        : "Server ready"
      : "Starting server";

  return {
    canReviewSave: hasSongs,
    hasSongs,
    isTransferring,
    progressLabel,
    statusLabel,
  };
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
