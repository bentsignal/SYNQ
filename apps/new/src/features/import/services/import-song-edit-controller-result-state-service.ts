import { getImportSongEditActionState } from "./import-song-edit-action-state-service";
import { getImportSongEditFieldState } from "./import-song-edit-field-state-service";
import type { ImportSongEditFormState } from "./import-song-edit-form-reducer-service";
import { getImportSongEditBackLinks } from "./import-song-edit-navigation-service";

export const getImportSongEditControllerResultState = ({
  formState,
}: {
  formState: ImportSongEditFormState;
}) => ({
  actionState: getImportSongEditActionState({
    title: formState.title,
  }),
  album: formState.album,
  artist: formState.artist,
  backLinks: getImportSongEditBackLinks(),
  error: formState.error,
  fieldState: getImportSongEditFieldState(),
  title: formState.title,
  track: formState.track,
});

export type ImportSongEditControllerResultState = ReturnType<
  typeof getImportSongEditControllerResultState
>;
