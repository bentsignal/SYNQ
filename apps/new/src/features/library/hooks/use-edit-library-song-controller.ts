import { useEffect, useReducer } from "react";
import { router } from "expo-router";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { updateLibrarySongMetadata } from "../repository/song-metadata-repository";
import {
  getLibrarySongEditActionState,
  getLibrarySongEditErrorMessage,
  getInitialLibrarySongEditControllerState,
  librarySongEditControllerReducer,
} from "../services/library-song-form-service";
import {
  getLibrarySongDetailHref,
  type LibrarySongDetail,
} from "../services/library-song-detail-service";

type UseEditLibrarySongControllerParams = {
  detail: LibrarySongDetail;
  songId: number;
};

export function useEditLibrarySongController({
  detail,
  songId,
}: UseEditLibrarySongControllerParams) {
  const { sendHaptic } = useHapticFeedback();
  const [formState, dispatchFormState] = useReducer(
    librarySongEditControllerReducer,
    undefined,
    getInitialLibrarySongEditControllerState,
  );
  const actionState = getLibrarySongEditActionState({
    detail,
    isSaving: formState.isSaving,
    title: formState.title,
  });

  useEffect(() => {
    dispatchFormState({ detail, songId, type: "hydrate" });
  }, [detail, songId]);

  const updateField =
    (field: "albumNames" | "artistNames" | "title") => (value: string) => {
      dispatchFormState({ field, type: "change-field", value });
    };

  const save = async () => {
    if (!actionState.canSave) {
      sendHaptic("error");
      return;
    }

    dispatchFormState({ type: "begin-save" });

    try {
      await updateLibrarySongMetadata({
        albumNames: formState.albumNames,
        artistNames: formState.artistNames,
        id: songId,
        title: formState.title,
      });
      sendHaptic("success");
      router.replace(getLibrarySongDetailHref({ songId }));
    } catch (caughtError) {
      sendHaptic("error");
      dispatchFormState({
        errorMessage: getLibrarySongEditErrorMessage(caughtError),
        type: "fail",
      });
    } finally {
      dispatchFormState({ type: "finish-save" });
    }
  };

  return {
    actionState,
    albumNames: formState.albumNames,
    artistNames: formState.artistNames,
    errorMessage: formState.errorMessage,
    save,
    setAlbumNames: updateField("albumNames"),
    setArtistNames: updateField("artistNames"),
    setTitle: updateField("title"),
    title: formState.title,
  };
}
