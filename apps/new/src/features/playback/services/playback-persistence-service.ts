import * as FileSystem from "expo-file-system/legacy";
import {
  clearPersistedPlaybackStateWithDependencies,
  loadPersistedPlaybackStateWithDependencies,
  savePersistedPlaybackStateWithDependencies,
  type PlaybackPersistenceDependencies,
} from "./playback-persistence-executor-service";
import type { PlaybackState } from "../types/playback-state";

const playbackPersistenceDependencies: PlaybackPersistenceDependencies = {
  deletePath: FileSystem.deleteAsync,
  documentDirectory: FileSystem.documentDirectory,
  getInfo: FileSystem.getInfoAsync,
  makeDirectory: FileSystem.makeDirectoryAsync,
  readAsString: FileSystem.readAsStringAsync,
  writeAsString: FileSystem.writeAsStringAsync,
};

export async function loadPersistedPlaybackState(): Promise<PlaybackState> {
  return loadPersistedPlaybackStateWithDependencies(
    playbackPersistenceDependencies,
  );
}

export async function savePersistedPlaybackState(state: PlaybackState) {
  await savePersistedPlaybackStateWithDependencies({
    dependencies: playbackPersistenceDependencies,
    state,
  });
}

export async function clearPersistedPlaybackState() {
  await clearPersistedPlaybackStateWithDependencies(
    playbackPersistenceDependencies,
  );
}
