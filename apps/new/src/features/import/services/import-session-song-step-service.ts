import type {
  ImportSessionState,
  ImportSongDraft,
} from "../types/import-session";

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
