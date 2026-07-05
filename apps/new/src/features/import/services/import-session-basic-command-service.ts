import {
  runBeginImportFilePickCommand,
  runFailImportSessionCommand,
  runReviewImportSongsCommand,
  runSetImportSaveToLibraryCommand,
  runUpdateImportSongCommand,
} from "./import-session-command-flow-service";
import type { ImportSessionAction } from "./import-session-action-service";
import type { ImportSongDraft } from "../types/import-session";

type CreateImportSessionBasicCommandsParams = {
  dispatch: (action: ImportSessionAction) => void;
};

export type ImportSessionBasicCommands = {
  beginFilePick: () => void;
  failSession: (error: string) => void;
  reviewSongs: (songs: ImportSongDraft[]) => void;
  setShouldSaveToLibrary: (shouldSaveToLibrary: boolean) => void;
  updateImportSong: (song: ImportSongDraft) => void;
};

export const createImportSessionBasicCommands = ({
  dispatch,
}: CreateImportSessionBasicCommandsParams): ImportSessionBasicCommands => ({
  beginFilePick: () => {
    runBeginImportFilePickCommand({ dispatch });
  },
  failSession: (error) => {
    runFailImportSessionCommand({ dispatch, error });
  },
  reviewSongs: (songs) => {
    runReviewImportSongsCommand({ dispatch, songs });
  },
  setShouldSaveToLibrary: (shouldSaveToLibrary) => {
    runSetImportSaveToLibraryCommand({ dispatch, shouldSaveToLibrary });
  },
  updateImportSong: (song) => {
    runUpdateImportSongCommand({ dispatch, song });
  },
});
