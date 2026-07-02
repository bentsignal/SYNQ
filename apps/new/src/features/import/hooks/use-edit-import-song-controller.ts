import { useState } from "react";
import { router } from "expo-router";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  buildEditedImportSongDraft,
  getImportSongEditActionState,
  getImportSongEditErrorMessage,
  getImportSongEditInitialState,
  getImportSongEditRequiredTitleMessage,
  getImportSongEditSaveHref,
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
  const initialState = getImportSongEditInitialState(song);
  const [album, setAlbum] = useState(initialState.album);
  const [artist, setArtist] = useState(initialState.artist);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(initialState.title);
  const [track, setTrack] = useState(initialState.track);
  const actionState = getImportSongEditActionState({ title });

  const updateTitle = (nextTitle: string) => {
    setTitle(nextTitle);
    setError(null);
  };

  const updateTrack = (nextTrack: string) => {
    setTrack(nextTrack);
    setError(null);
  };

  const save = () => {
    if (!actionState.canSave) {
      sendHaptic("error");
      setError(getImportSongEditRequiredTitleMessage());
      return;
    }

    try {
      updateImportSong(
        buildEditedImportSongDraft({
          album,
          artist,
          song,
          title,
          track,
        }),
      );
      sendHaptic("success");
      router.replace(getImportSongEditSaveHref());
    } catch (caughtError) {
      sendHaptic("error");
      setError(getImportSongEditErrorMessage(caughtError));
    }
  };

  return {
    actionState,
    album,
    artist,
    error,
    save,
    setAlbum,
    setArtist,
    title,
    track,
    updateTitle,
    updateTrack,
  };
}
