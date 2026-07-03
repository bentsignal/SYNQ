import { useCallback, useMemo } from "react";
import { createImportCacheDirectory } from "../services/import-file-cache-service";
import {
  getFinishWifiTransferAction,
  getImportSessionCommandErrorMessage,
  type ImportSessionAction,
} from "../services/import-session-state-service";
import type { ImportSongDraft } from "../types/import-session";

type UseImportSessionWifiCommandsParams = {
  dispatch: (action: ImportSessionAction) => void;
  songs: ImportSongDraft[];
};

export function useImportSessionWifiCommands({
  dispatch,
  songs,
}: UseImportSessionWifiCommandsParams) {
  const beginWifiTransfer = useCallback(
    async (total: number) => {
      try {
        await createImportCacheDirectory();
        dispatch({ total, type: "begin-wifi-transfer" });
        return true;
      } catch (caughtError) {
        dispatch({
          error: getImportSessionCommandErrorMessage({
            caughtError,
            mutation: "begin-wifi-transfer",
          }),
          type: "fail",
        });
        return false;
      }
    },
    [dispatch],
  );

  const receiveWifiSong = useCallback(
    (song: ImportSongDraft) => {
      dispatch({ song, type: "receive-wifi-song" });
    },
    [dispatch],
  );

  const finishWifiTransfer = useCallback(() => {
    dispatch(getFinishWifiTransferAction(songs));
  }, [dispatch, songs]);

  return useMemo(
    () => ({
      beginWifiTransfer,
      finishWifiTransfer,
      receiveWifiSong,
    }),
    [beginWifiTransfer, finishWifiTransfer, receiveWifiSong],
  );
}
