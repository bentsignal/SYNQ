import { replaceNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { runImportSongEditSaveCommand } from "../services/import-song-edit-command-flow-service";
import type {
  ImportSongEditFormAction,
  ImportSongEditFormState,
} from "../services/import-song-edit-form-state-service";
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
    runImportSongEditSaveCommand({
      canSave,
      dispatch: dispatchFormState,
      formState,
      replaceRoute: replaceNativeRoute,
      sendHaptic,
      song,
      updateImportSong,
    });
  };

  return {
    save,
  };
}
