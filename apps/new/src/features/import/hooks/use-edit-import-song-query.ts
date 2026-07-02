import { useMemo } from "react";
import { getImportSongDraftForEdit } from "../services/import-song-form-service";
import { useImportSession } from "./use-import-session";

export function useEditImportSongQuery(songId: number) {
  const { state, updateImportSong } = useImportSession();
  const song = useMemo(
    () => getImportSongDraftForEdit({ songId, songs: state.songs }),
    [songId, state.songs],
  );

  return {
    song,
    updateImportSong,
  };
}
