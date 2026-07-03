import { useCallback, useMemo } from "react";
import { createImportCacheDirectory } from "../services/import-file-cache-service";
import {
  getBeginWifiTransferAction,
  getFailImportSessionAction,
  getFinishWifiTransferAction,
  getImportSessionCommandErrorMessage,
  getReceiveWifiSongAction,
} from "../services/import-session-command-service";
import type { ImportSessionAction } from "../services/import-session-state-service";
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
        dispatch(getBeginWifiTransferAction(total));
        return true;
      } catch (caughtError) {
        dispatch(
          getFailImportSessionAction(
            getImportSessionCommandErrorMessage({
              caughtError,
              mutation: "begin-wifi-transfer",
            }),
          ),
        );
        return false;
      }
    },
    [dispatch],
  );

  const receiveWifiSong = useCallback(
    (song: ImportSongDraft) => {
      dispatch(getReceiveWifiSongAction(song));
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
