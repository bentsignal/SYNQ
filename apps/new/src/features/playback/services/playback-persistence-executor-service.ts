import { initialPlaybackState } from "./playback-initial-state-service";
import {
  parsePersistedPlaybackState,
  stringifyPersistedPlaybackState,
} from "./playback-persistence-codec-service";
import {
  getPlaybackStateDirectoryWithDependencies,
  getPlaybackStateFileWithDependencies,
} from "./playback-persistence-path-service";
import type { PlaybackState } from "../types/playback-state";

export {
  getPlaybackStateDirectoryWithDependencies,
  getPlaybackStateFileWithDependencies,
} from "./playback-persistence-path-service";

export type PlaybackPersistenceDependencies = {
  deletePath: (
    path: string,
    options: { idempotent: true },
  ) => Promise<void>;
  documentDirectory: string | null;
  getInfo: (path: string) => Promise<{ exists: boolean }>;
  makeDirectory: (
    path: string,
    options: { intermediates: true },
  ) => Promise<void>;
  readAsString: (path: string) => Promise<string>;
  writeAsString: (path: string, contents: string) => Promise<void>;
};

export async function loadPersistedPlaybackStateWithDependencies(
  dependencies: PlaybackPersistenceDependencies,
): Promise<PlaybackState> {
  try {
    const playbackStateFile = getPlaybackStateFileWithDependencies(dependencies);
    const fileInfo = await dependencies.getInfo(playbackStateFile);
    if (!fileInfo.exists) {
      return initialPlaybackState;
    }

    const contents = await dependencies.readAsString(playbackStateFile);

    return parsePersistedPlaybackState(contents);
  } catch {
    return initialPlaybackState;
  }
}

export async function savePersistedPlaybackStateWithDependencies({
  dependencies,
  state,
}: {
  dependencies: PlaybackPersistenceDependencies;
  state: PlaybackState;
}) {
  const playbackStateDirectory =
    getPlaybackStateDirectoryWithDependencies(dependencies);
  await dependencies.makeDirectory(playbackStateDirectory, {
    intermediates: true,
  });
  await dependencies.writeAsString(
    getPlaybackStateFileWithDependencies(dependencies),
    stringifyPersistedPlaybackState(state),
  );
}

export async function clearPersistedPlaybackStateWithDependencies(
  dependencies: PlaybackPersistenceDependencies,
) {
  await dependencies.deletePath(
    getPlaybackStateFileWithDependencies(dependencies),
    {
      idempotent: true,
    },
  );
}
