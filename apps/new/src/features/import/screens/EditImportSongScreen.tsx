import { useLocalSearchParams } from "expo-router";
import { parseNumericRouteParam } from "@/src/features/app-shell/services/route-param-service";
import { EditImportSongConnectedForm } from "../components/EditImportSongConnectedForm";
import { EditImportSongInvalidState } from "../components/EditImportSongInvalidState";
import { useEditImportSongQuery } from "../hooks/use-edit-import-song-query";

export function EditImportSongScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = parseNumericRouteParam(params.id);

  if (id === null) {
    return <EditImportSongInvalidState reason="invalid-id" />;
  }

  return <EditImportSongContent songId={id} />;
}

function EditImportSongContent({ songId }: { songId: number }) {
  const { song, updateImportSong } = useEditImportSongQuery(songId);

  if (!song) {
    return <EditImportSongInvalidState reason="not-staged" />;
  }

  return (
    <EditImportSongConnectedForm
      song={song}
      updateImportSong={updateImportSong}
    />
  );
}
