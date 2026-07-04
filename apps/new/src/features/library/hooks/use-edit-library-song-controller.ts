import { useEffect, useReducer } from "react";
import {
  getLibrarySongEditChangeFieldAction,
  getLibrarySongEditHydrateAction,
  getInitialLibrarySongEditControllerState,
  type LibrarySongEditControllerField,
  librarySongEditControllerReducer,
} from "../services/library-song-form-service";
import { getLibrarySongEditControllerResultState } from "../services/library-song-edit-screen-state-service";
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
  const resultState = getLibrarySongEditControllerResultState({
    detail,
    formState,
    songId,
  });

  useEffect(() => {
    dispatchFormState(getLibrarySongEditHydrateAction({ detail, songId }));
  }, [detail, songId]);

  const updateField =
    (field: LibrarySongEditControllerField) => (value: string) => {
      dispatchFormState(getLibrarySongEditChangeFieldAction({ field, value }));
    };

  const { pickCoverImage, save } = useEditLibrarySongCommands({
    canPickCoverImage: resultState.actionState.canPickCoverImage,
    canSave: resultState.actionState.canSave,
    dispatchFormState,
    formState,
    songId,
  });

  return {
    ...resultState,
    pickCoverImage,
    save,
    setAlbumNames: updateField("albumNames"),
    setArtistNames: updateField("artistNames"),
    setTitle: updateField("title"),
  };
}
