import { replaceNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  buildEditedImportSongDraft,
  type ImportSongEditFormAction,
  type ImportSongEditFormState,
} from "../services/import-song-form-service";
import {
  getImportSongEditInvalidSaveCommand,
  getImportSongEditSaveFailureCommand,
  getImportSongEditSaveSuccessCommand,
} from "../services/import-song-edit-command-service";
import type { ImportSongDraft } from "../types/import-session";

type UseEditImportSongCommandsParams = {
  canSave: boolean;
  dispatchFormState: React.Dispatch<ImportSongEditFormAction>;
  formState: ImportSongEditFormState;
  song: ImportSongDraft;
  updateImportSong: (song: ImportSongDraft) => void;
};

export function useEditImportSongCommands({
  canSave,
  dispatchFormState,
  formState,
  song,
  updateImportSong,
}: UseEditImportSongCommandsParams) {
  const { sendHaptic } = useHapticFeedback();

  const save = () => {
    if (!canSave) {
      const command = getImportSongEditInvalidSaveCommand();
      sendHaptic(command.haptic);
      dispatchFormState(command.action);
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
      replaceNativeRoute(command.href);
    } catch (caughtError) {
      const command = getImportSongEditSaveFailureCommand(caughtError);
      sendHaptic(command.haptic);
      dispatchFormState(command.action);
    }
  };

  return {
    save,
  };
}
