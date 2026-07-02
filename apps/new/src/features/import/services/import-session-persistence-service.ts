import * as FileSystem from "expo-file-system";
import type { ImportSessionState, ImportSongDraft } from "../types/import-session";

const importSessionDirectoryName = "import";
const importSessionFileName = "session.json";

type PersistedImportSession = {
  selectedSongId: number | null;
  shouldSaveToLibrary: boolean;
  songs: ImportSongDraft[];
  source: ImportSessionState["source"];
};

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

const isDraft = (value: unknown): value is ImportSongDraft => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Partial<ImportSongDraft>;

  return (
    typeof draft.album === "string" &&
    typeof draft.artist === "string" &&
    typeof draft.cacheUri === "string" &&
    typeof draft.fileName === "string" &&
    typeof draft.fileType === "string" &&
    typeof draft.id === "number" &&
    typeof draft.title === "string"
  );
};

const normalizePersistedSession = (
  value: unknown,
): PersistedImportSession | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const session = value as Partial<PersistedImportSession>;
  const songs = Array.isArray(session.songs)
    ? session.songs.filter(isDraft)
    : [];

  if (songs.length === 0) {
    return null;
  }

  return {
    selectedSongId:
      typeof session.selectedSongId === "number"
        ? session.selectedSongId
        : songs[0]?.id ?? null,
    shouldSaveToLibrary:
      typeof session.shouldSaveToLibrary === "boolean"
        ? session.shouldSaveToLibrary
        : true,
    songs,
    source: session.source === "wifi" ? "wifi" : "files",
  };
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
    const persistedSession = normalizePersistedSession(JSON.parse(contents));

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
    JSON.stringify(
      {
        selectedSongId: state.selectedSongId,
        shouldSaveToLibrary: state.shouldSaveToLibrary,
        songs: state.songs,
        source: state.source,
      } satisfies PersistedImportSession,
      null,
      2,
    ),
  );
}

export async function clearPersistedImportSessionState() {
  try {
    await FileSystem.deleteAsync(getImportSessionFile(), { idempotent: true });
  } catch {
    // Cleanup should be best-effort when the document directory is unavailable.
  }
}
