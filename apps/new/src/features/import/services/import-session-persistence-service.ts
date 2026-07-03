import * as FileSystem from "expo-file-system";
import type { ImportSessionState, ImportSongDraft } from "../types/import-session";
import {
  normalizePersistedImportSession,
  toPersistedImportSession,
} from "./import-session-persistence-normalizer-service";

const importSessionDirectoryName = "import";
const importSessionFileName = "session.json";

const getImportSessionDirectory = () => {
  if (!FileSystem.documentDirectory) {
    throw new Error("Document directory is unavailable.");
  }

  return `${FileSystem.documentDirectory}${importSessionDirectoryName}`;
};

const getImportSessionFile = () => {
  return `${getImportSessionDirectory()}/${importSessionFileName}`;
};

const ensureImportSessionDirectory = async () => {
  await FileSystem.makeDirectoryAsync(getImportSessionDirectory(), {
    intermediates: true,
  });
};

const filterExistingDrafts = async (songs: ImportSongDraft[]) => {
  const existingSongs: ImportSongDraft[] = [];

  for (const song of songs) {
    const fileInfo = await FileSystem.getInfoAsync(song.cacheUri);
    if (fileInfo.exists) {
      existingSongs.push(song);
    }
  }

  return existingSongs;
};

export async function loadPersistedImportSessionState(): Promise<ImportSessionState | null> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(getImportSessionFile());
    if (!fileInfo.exists) {
      return null;
    }

    const contents = await FileSystem.readAsStringAsync(getImportSessionFile());
    const persistedSession = normalizePersistedImportSession(
      JSON.parse(contents),
    );

    if (!persistedSession) {
      await clearPersistedImportSessionState();
      return null;
    }

    const songs = await filterExistingDrafts(persistedSession.songs);
    if (songs.length === 0) {
      await clearPersistedImportSessionState();
      return null;
    }

    return {
      error: null,
      phase: "reviewing",
      progress: {
        current: songs.length,
        total: songs.length,
      },
      saveSummary: null,
      selectedSongId:
        songs.some((song) => song.id === persistedSession.selectedSongId)
          ? persistedSession.selectedSongId
          : songs[0]?.id ?? null,
      shouldSaveToLibrary: persistedSession.shouldSaveToLibrary,
      songs,
      source: persistedSession.source,
    };
  } catch {
    return null;
  }
}

export async function savePersistedImportSessionState(
  state: ImportSessionState,
) {
  if (state.songs.length === 0) {
    await clearPersistedImportSessionState();
    return;
  }

  await ensureImportSessionDirectory();
  await FileSystem.writeAsStringAsync(
    getImportSessionFile(),
    JSON.stringify(toPersistedImportSession(state), null, 2),
  );
}

export async function clearPersistedImportSessionState() {
  try {
    await FileSystem.deleteAsync(getImportSessionFile(), { idempotent: true });
  } catch {
    // Cleanup should be best-effort when the document directory is unavailable.
  }
}
