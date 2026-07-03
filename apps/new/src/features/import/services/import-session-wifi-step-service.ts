import type {
  ImportSessionState,
  ImportSongDraft,
} from "../types/import-session";

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
