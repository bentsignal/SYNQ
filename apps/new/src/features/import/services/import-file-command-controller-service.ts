import {
  runImportFileRemovalCommand,
  runImportFileSelectionCommand,
  type ImportFileCommandFlowDependencies,
} from "./import-file-command-flow-service";
import type { ImportSessionAction } from "./import-session-state-service";
import type { ImportSongDraft } from "../types/import-session";

type CreateImportFileCommandsParams = {
  dependencies: ImportFileCommandFlowDependencies;
  dispatch: (action: ImportSessionAction) => void;
  songs: ImportSongDraft[];
};

export type ImportFileCommands = {
  removeImportSongs: (songIds: number[]) => Promise<boolean>;
  startFileImport: () => Promise<boolean>;
};

export const createImportFileCommands = ({
  dependencies,
  dispatch,
  songs,
}: CreateImportFileCommandsParams): ImportFileCommands => ({
  removeImportSongs: (songIds) =>
    runImportFileRemovalCommand({
      dependencies,
      dispatch,
      songIds,
      songs,
    }),
  startFileImport: () =>
    runImportFileSelectionCommand({
      dependencies,
      dispatch,
    }),
});
