import * as FileSystem from "expo-file-system";
import { initialPlaybackState } from "./playback-session-service";
import type { PlaybackState } from "../types/playback-state";
import {
  normalizePlaybackState,
  toPersistedPlaybackState,
} from "./playback-persistence-codec-service";

const playbackStateDirectory = `${FileSystem.documentDirectory}playback`;
const playbackStateFile = `${playbackStateDirectory}/session.json`;

const ensurePlaybackStateDirectory = async () => {
  if (!FileSystem.documentDirectory) {
    throw new Error("The document directory is not available.");
  }

  await FileSystem.makeDirectoryAsync(playbackStateDirectory, {
    intermediates: true,
  });
};

export async function loadPersistedPlaybackState(): Promise<PlaybackState> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(playbackStateFile);
    if (!fileInfo.exists) {
      return initialPlaybackState;
    }

    const contents = await FileSystem.readAsStringAsync(playbackStateFile);

    return normalizePlaybackState(JSON.parse(contents));
  } catch {
    return initialPlaybackState;
  }
}

export async function savePersistedPlaybackState(state: PlaybackState) {
  await ensurePlaybackStateDirectory();
  await FileSystem.writeAsStringAsync(
    playbackStateFile,
    JSON.stringify(toPersistedPlaybackState(state)),
  );
}

export async function clearPersistedPlaybackState() {
  await FileSystem.deleteAsync(playbackStateFile, { idempotent: true });
}
