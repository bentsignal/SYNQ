import { initialPlaybackState } from "./playback-initial-state-service";
import {
  normalizePlaybackState,
  toPersistedPlaybackState,
} from "./playback-persistence-codec-service";
import type { PlaybackState } from "../types/playback-state";

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

const playbackStateDirectoryName = "playback";
const playbackStateFileName = "session.json";

export const getPlaybackStateDirectoryWithDependencies = ({
  documentDirectory,
}: Pick<PlaybackPersistenceDependencies, "documentDirectory">) => {
  if (!documentDirectory) {
    throw new Error("The document directory is not available.");
  }

  return `${documentDirectory}${playbackStateDirectoryName}`;
};

export const getPlaybackStateFileWithDependencies = (
  dependencies: Pick<PlaybackPersistenceDependencies, "documentDirectory">,
) =>
  `${getPlaybackStateDirectoryWithDependencies(
    dependencies,
  )}/${playbackStateFileName}`;

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

    return normalizePlaybackState(JSON.parse(contents));
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
    `${playbackStateDirectory}/${playbackStateFileName}`,
    JSON.stringify(toPersistedPlaybackState(state)),
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
