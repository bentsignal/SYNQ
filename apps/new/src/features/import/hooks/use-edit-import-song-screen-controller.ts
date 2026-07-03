import { useMemo } from "react";
import { useNumericRouteParam } from "@/src/features/app-shell/hooks/use-numeric-route-param";
import {
  getImportSongEditScreenState,
  type ImportSongEditScreenState,
} from "../services/import-song-edit-screen-state-service";
import type { ImportSongDraft } from "../types/import-session";
import { useImportSessionSelector } from "./use-import-session";

export type EditImportSongScreenController =
  | Extract<ImportSongEditScreenState, { type: "invalid" }>
  | {
      song: ImportSongDraft;
      type: "ready";
      updateImportSong: (song: ImportSongDraft) => void;
    };

export function useEditImportSongScreenController(): EditImportSongScreenController {
  const songId = useNumericRouteParam();
  const state = useImportSessionSelector((store) => store.state);
  const updateImportSong = useImportSessionSelector(
    (store) => store.updateImportSong,
  );
  const screenState = useMemo(
    () =>
      getImportSongEditScreenState({
        songId,
        songs: state.songs,
      }),
    [songId, state.songs],
  );

  if (screenState.type === "invalid") {
    return screenState;
  }

  return {
    ...screenState,
    updateImportSong,
  };
}
