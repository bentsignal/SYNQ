import { useReducer } from "react";
import {
  getImportSongEditActionState,
  getImportSongEditInitialState,
  importSongEditFormReducer,
} from "../services/import-song-edit-form-state-service";
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

  const { save } = useEditImportSongCommands({
    canSave: actionState.canSave,
    dispatchFormState,
    formState,
    song,
    updateImportSong,
  });

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
