import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { parseNumericRouteParam } from "@/src/features/app-shell/services/route-param-service";
import { EditImportSongConnectedForm } from "../components/EditImportSongConnectedForm";
import { EditImportSongInvalidState } from "../components/EditImportSongInvalidState";
import { useImportSession } from "../hooks/use-import-session";

export function EditImportSongScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = parseNumericRouteParam(params.id);

  if (id === null) {
    return <EditImportSongInvalidState reason="invalid-id" />;
  }

  return <EditImportSongContent songId={id} />;
}

function EditImportSongContent({ songId }: { songId: number }) {
  const { state, updateImportSong } = useImportSession();
  const song = useMemo(
    () => state.songs.find((draft) => draft.id === songId) ?? null,
    [songId, state.songs],
  );

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
