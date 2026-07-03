import { useMemo } from "react";
import { getImportSongDraftForEdit } from "../services/import-song-form-service";
import { useImportSessionSelector } from "./use-import-session";

export function useEditImportSongQuery(songId: number) {
  const state = useImportSessionSelector((store) => store.state);
  const updateImportSong = useImportSessionSelector(
    (store) => store.updateImportSong,
  );
  const song = useMemo(
    () => getImportSongDraftForEdit({ songId, songs: state.songs }),
    [songId, state.songs],
  );

  return {
    song,
    updateImportSong,
  };
}
