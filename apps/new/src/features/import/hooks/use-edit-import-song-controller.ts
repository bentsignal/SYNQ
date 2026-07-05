import { useReducer } from "react";
import { getImportSongEditControllerResultState } from "../services/import-song-edit-controller-result-state-service";
import {
  getImportSongEditChangeFieldAction,
  type ImportSongEditFormField,
  getImportSongEditInitialState,
  importSongEditFormReducer,
} from "../services/import-song-edit-form-reducer-service";
import type { ImportSongDraft } from "../types/import-session";
import { useEditImportSongCommands } from "./use-edit-import-song-commands";

type UseEditImportSongControllerParams = {
  song: ImportSongDraft;
  updateImportSong: (song: ImportSongDraft) => void;
};

export function useEditImportSongController({
  song,
  updateImportSong,
}: UseEditImportSongControllerParams) {
  const [formState, dispatchFormState] = useReducer(
    importSongEditFormReducer,
    song,
    getImportSongEditInitialState,
  );
  const resultState = getImportSongEditControllerResultState({
    formState,
  });

  const updateField =
    (field: ImportSongEditFormField) => (value: string) => {
      dispatchFormState(getImportSongEditChangeFieldAction({ field, value }));
    };

  const updateAlbum = updateField("album");
  const updateArtist = updateField("artist");
  const updateTitle = updateField("title");
  const updateTrack = updateField("track");

  const { save } = useEditImportSongCommands({
    canSave: resultState.actionState.canSave,
    dispatchFormState,
    formState,
    song,
    updateImportSong,
  });

  return {
    ...resultState,
    save,
    setAlbum: updateAlbum,
    setArtist: updateArtist,
    updateTitle,
    updateTrack,
  };
}
