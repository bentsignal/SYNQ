import {
  getBeginFilePickAction,
  getFailImportSessionAction,
  getReviewImportSongsAction,
  getSetImportSaveToLibraryAction,
  getUpdateImportSongAction,
} from "./import-session-action-service";
import type { ImportSessionAction } from "./import-session-action-service";
import type { ImportSongDraft } from "../types/import-session";

type ImportSessionCommandDispatch = (action: ImportSessionAction) => void;

export const runBeginImportFilePickCommand = ({
  dispatch,
}: {
  dispatch: ImportSessionCommandDispatch;
}) => {
  dispatch(getBeginFilePickAction());
};

export const runFailImportSessionCommand = ({
  dispatch,
  error,
}: {
  dispatch: ImportSessionCommandDispatch;
  error: string;
}) => {
  dispatch(getFailImportSessionAction(error));
};

export const runReviewImportSongsCommand = ({
  dispatch,
  songs,
}: {
  dispatch: ImportSessionCommandDispatch;
  songs: ImportSongDraft[];
}) => {
  dispatch(getReviewImportSongsAction(songs));
};

export const runSetImportSaveToLibraryCommand = ({
  dispatch,
  shouldSaveToLibrary,
}: {
  dispatch: ImportSessionCommandDispatch;
  shouldSaveToLibrary: boolean;
}) => {
  dispatch(getSetImportSaveToLibraryAction(shouldSaveToLibrary));
};

export const runUpdateImportSongCommand = ({
  dispatch,
  song,
}: {
  dispatch: ImportSessionCommandDispatch;
  song: ImportSongDraft;
}) => {
  dispatch(getUpdateImportSongAction(song));
};
