import { useNumericRouteParam } from "@/src/features/app-shell/hooks/use-numeric-route-param";
import { EditLibrarySongFormView } from "../components/EditLibrarySongFormView";
import { LibraryInvalidSongState } from "../components/LibraryInvalidSongState";
import { useEditLibrarySongController } from "../hooks/use-edit-library-song-controller";
import { useLibrarySongDetailQuery } from "../hooks/use-library-song-detail-query";
import { getLibrarySongEditScreenViewState } from "../services/library-song-edit-screen-state-service";
import { getLibraryInvalidSongState } from "../services/library-song-interaction-service";

export function EditLibrarySongScreen() {
  const id = useNumericRouteParam();

  if (id === null) {
    return <LibraryInvalidSongState state={getLibraryInvalidSongState()} />;
  }

  return <EditLibrarySongContent songId={id} />;
}

function EditLibrarySongContent({ songId }: { songId: number }) {
  const { detail, errors } = useLibrarySongDetailQuery(songId);
  const {
    actionState,
    albumNames,
    artistNames,
    coverImage,
    errorMessage,
    pickCoverImage,
    save,
    setAlbumNames,
    setArtistNames,
    setTitle,
    title,
  } = useEditLibrarySongController({
    detail,
    songId,
  });
  const screenViewState = getLibrarySongEditScreenViewState({
    detail,
    errors,
    mutationError: errorMessage,
  });

  return (
    <EditLibrarySongFormView
      actionState={actionState}
      albumNames={albumNames}
      artistNames={artistNames}
      coverImage={coverImage}
      detail={detail}
      onChangeAlbumNames={setAlbumNames}
      onChangeArtistNames={setArtistNames}
      onChangeTitle={setTitle}
      onPickCoverImage={pickCoverImage}
      onSave={save}
      screenViewState={screenViewState}
      title={title}
    />
  );
}
