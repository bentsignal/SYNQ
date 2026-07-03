import { useReducer } from "react";
import { router } from "expo-router";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  buildEditedImportSongDraft,
  getImportSongEditActionState,
  getImportSongEditErrorMessage,
  getImportSongEditInitialState,
  getImportSongEditRequiredTitleMessage,
  importSongEditFormReducer,
} from "../services/import-song-form-service";
import { getImportSongEditSaveHref } from "../services/import-song-edit-navigation-service";
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
      sendHaptic("error");
      dispatchFormState({
        error: getImportSongEditRequiredTitleMessage(),
        type: "fail",
      });
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
      sendHaptic("success");
      router.replace(getImportSongEditSaveHref());
    } catch (caughtError) {
      sendHaptic("error");
      dispatchFormState({
        error: getImportSongEditErrorMessage(caughtError),
        type: "fail",
      });
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
