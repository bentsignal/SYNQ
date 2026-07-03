import { useNumericRouteParam } from "@/src/features/app-shell/hooks/use-numeric-route-param";
import { EditLibrarySongFormView } from "../components/EditLibrarySongFormView";
import { LibraryInvalidSongState } from "../components/LibraryInvalidSongState";
import { useEditLibrarySongController } from "../hooks/use-edit-library-song-controller";
import { useLibrarySongDetailQuery } from "../hooks/use-library-song-detail-query";

export function EditLibrarySongScreen() {
  const id = useNumericRouteParam();

  if (id === null) {
    return <LibraryInvalidSongState />;
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

  return (
    <EditLibrarySongFormView
      actionState={actionState}
      albumNames={albumNames}
      artistNames={artistNames}
      coverImage={coverImage}
      detail={detail}
      errorMessage={errorMessage}
      errors={errors}
      onChangeAlbumNames={setAlbumNames}
      onChangeArtistNames={setArtistNames}
      onChangeTitle={setTitle}
      onPickCoverImage={pickCoverImage}
      onSave={save}
      songId={songId}
      title={title}
    />
  );
}
