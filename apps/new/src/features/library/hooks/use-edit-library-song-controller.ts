import { useEffect, useReducer } from "react";
import {
  getInitialLibrarySongEditControllerState,
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
  });

  useEffect(() => {
    dispatchFormState({ detail, songId, type: "hydrate" });
  }, [detail, songId]);

  const updateField =
    (field: "albumNames" | "artistNames" | "title") => (value: string) => {
      dispatchFormState({ field, type: "change-field", value });
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
