import { useReducer } from "react";
import { replaceNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  buildEditedImportSongDraft,
  getImportSongEditActionState,
  getImportSongEditInvalidSaveCommand,
  getImportSongEditInitialState,
  getImportSongEditSaveFailureCommand,
  getImportSongEditSaveSuccessCommand,
  importSongEditFormReducer,
} from "../services/import-song-form-service";
import type { ImportSongDraft } from "../types/import-session";

type UseEditImportSongControllerParams = {
  song: ImportSongDraft;
  updateImportSong: (song: ImportSongDraft) => void;
};

export function useEditImportSongController({
  song,
  updateImportSong,
}: UseEditImportSongControllerParams) {
  const { sendHaptic } = useHapticFeedback();
  const [formState, dispatchFormState] = useReducer(
    importSongEditFormReducer,
    song,
    getImportSongEditInitialState,
  );
  const actionState = getImportSongEditActionState({
    title: formState.title,
  });

  const updateField =
    (field: "album" | "artist" | "title" | "track") => (value: string) => {
      dispatchFormState({ field, type: "change-field", value });
    };

  const updateAlbum = updateField("album");
  const updateArtist = updateField("artist");
  const updateTitle = updateField("title");
  const updateTrack = updateField("track");

  const save = () => {
    if (!actionState.canSave) {
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
    actionState,
    album: formState.album,
    artist: formState.artist,
    error: formState.error,
    save,
    setAlbum: updateAlbum,
    setArtist: updateArtist,
    title: formState.title,
    track: formState.track,
    updateTitle,
    updateTrack,
  };
}
