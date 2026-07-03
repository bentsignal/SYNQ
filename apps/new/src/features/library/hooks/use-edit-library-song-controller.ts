import { useEffect, useReducer } from "react";
import {
  getInitialLibrarySongEditControllerState,
  librarySongEditControllerReducer,
} from "../services/library-song-form-service";
import { getLibrarySongEditActionState } from "../services/library-song-edit-screen-state-service";
import { type LibrarySongDetail } from "../services/library-song-detail-service";
import { useEditLibrarySongCommands } from "./use-edit-library-song-commands";

type UseEditLibrarySongControllerParams = {
  detail: LibrarySongDetail;
  songId: number;
};

export function useEditLibrarySongController({
  detail,
  songId,
}: UseEditLibrarySongControllerParams) {
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

  const { pickCoverImage, save } = useEditLibrarySongCommands({
    canPickCoverImage: actionState.canPickCoverImage,
    canSave: actionState.canSave,
    dispatchFormState,
    formState,
    songId,
  });

  return {
    actionState,
    albumNames: formState.albumNames,
    artistNames: formState.artistNames,
    coverImage: formState.coverImage,
    errorMessage: formState.errorMessage,
    pickCoverImage,
    save,
    setAlbumNames: updateField("albumNames"),
    setArtistNames: updateField("artistNames"),
    setTitle: updateField("title"),
    title: formState.title,
  };
}
