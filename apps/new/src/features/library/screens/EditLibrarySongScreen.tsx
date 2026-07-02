import { useLocalSearchParams } from "expo-router";
import { parseNumericRouteParam } from "@/src/features/app-shell/services/route-param-service";
import { EditLibrarySongFormView } from "../components/EditLibrarySongFormView";
import { LibraryInvalidSongState } from "../components/LibraryInvalidSongState";
import { useEditLibrarySongController } from "../hooks/use-edit-library-song-controller";
import { useLibrarySongDetailQuery } from "../hooks/use-library-song-detail-query";

export function EditLibrarySongScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = parseNumericRouteParam(params.id);

  if (id === null) {
    return <LibraryInvalidSongState />;
  }

  return <EditLibrarySongContent songId={id} />;
}

function EditLibrarySongContent({ songId }: { songId: number }) {
  const { detail, errors } = useLibrarySongDetailQuery(songId);
  const hasErrors = errors.length > 0;
  const {
    actionState,
    albumNames,
    artistNames,
    errorMessage,
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
      detail={detail}
      errorMessage={errorMessage}
      hasErrors={hasErrors}
      onChangeAlbumNames={setAlbumNames}
      onChangeArtistNames={setArtistNames}
      onChangeTitle={setTitle}
      onSave={save}
      songId={songId}
      title={title}
    />
  );
}
