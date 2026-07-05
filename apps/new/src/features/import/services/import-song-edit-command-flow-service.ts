import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { ImportSongDraft } from "../types/import-session";
import {
  getImportSongEditInvalidSaveCommand,
  getImportSongEditSaveFailureCommand,
  getImportSongEditSaveSuccessCommand,
} from "./import-song-edit-command-service";
import {
  type ImportSongEditFormAction,
  type ImportSongEditFormState,
} from "./import-song-edit-form-reducer-service";
import { buildEditedImportSongDraft } from "./import-song-edit-draft-service";
import type { ImportSongEditHref } from "./import-song-edit-navigation-service";

type ImportSongEditDispatch = (action: ImportSongEditFormAction) => void;

type HapticSender = (type: HapticFeedbackType) => void;

type NativeRouteReplacer = (href: ImportSongEditHref) => void;

export const runImportSongEditSaveCommand = ({
  canSave,
  dispatch,
  formState,
  replaceRoute,
  sendHaptic,
  song,
  updateImportSong,
}: {
  canSave: boolean;
  dispatch: ImportSongEditDispatch;
  formState: ImportSongEditFormState;
  replaceRoute: NativeRouteReplacer;
  sendHaptic: HapticSender;
  song: ImportSongDraft;
  updateImportSong: (song: ImportSongDraft) => void;
}) => {
  if (!canSave) {
    const command = getImportSongEditInvalidSaveCommand();
    sendHaptic(command.haptic);
    dispatch(command.action);
    return;
  }

  try {
    updateImportSong(
      buildEditedImportSongDraft({
        album: formState.album,
        artist: formState.artist,
        song,
        title: formState.title,
        track: formState.track,
      }),
    );
    const command = getImportSongEditSaveSuccessCommand();
    sendHaptic(command.haptic);
    replaceRoute(command.href);
  } catch (caughtError) {
    const command = getImportSongEditSaveFailureCommand(caughtError);
    sendHaptic(command.haptic);
    dispatch(command.action);
  }
};
