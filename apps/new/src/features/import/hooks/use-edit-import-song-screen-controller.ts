import { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { parseNumericRouteParam } from "@/src/features/app-shell/services/route-param-service";
import {
  getImportSongEditScreenState,
  type ImportSongEditScreenState,
} from "../services/import-song-form-service";
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
  const params = useLocalSearchParams<{ id?: string }>();
  const songId = parseNumericRouteParam(params.id);
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
