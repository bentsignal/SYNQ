import { useEffect, useState } from "react";
import { router } from "expo-router";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { updateLibrarySongMetadata } from "../repository/song-metadata-repository";
import {
  buildLibrarySongEditFormState,
  getLibrarySongEditActionState,
  getLibrarySongEditErrorMessage,
} from "../services/library-song-form-service";
import type { LibrarySongDetail } from "../services/library-song-detail-service";

type UseEditLibrarySongControllerParams = {
  detail: LibrarySongDetail;
  songId: number;
};

export function useEditLibrarySongController({
  detail,
  songId,
}: UseEditLibrarySongControllerParams) {
  const { sendHaptic } = useHapticFeedback();
  const [albumNames, setAlbumNames] = useState("");
  const [artistNames, setArtistNames] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadedSongId, setLoadedSongId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const actionState = getLibrarySongEditActionState({
    detail,
    isSaving,
    title,
  });

  useEffect(() => {
    if (detail.isMissing || loadedSongId === songId) {
      return;
    }

    const formState = buildLibrarySongEditFormState(detail);
    setTitle(formState.title);
    setArtistNames(formState.artistNames);
    setAlbumNames(formState.albumNames);
    setLoadedSongId(songId);
  }, [detail, loadedSongId, songId]);

  const save = async () => {
    if (!actionState.canSave) {
      sendHaptic("error");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await updateLibrarySongMetadata({
        albumNames,
        artistNames,
        id: songId,
        title,
      });
      sendHaptic("success");
      router.replace(`/(tabs)/library/song/${songId}`);
    } catch (caughtError) {
      sendHaptic("error");
      setErrorMessage(getLibrarySongEditErrorMessage(caughtError));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    actionState,
    albumNames,
    artistNames,
    errorMessage,
    save,
    setAlbumNames,
    setArtistNames,
    setTitle,
    title,
  };
}
