import { useCallback, useMemo } from "react";
import { createImportCacheDirectory } from "../services/import-file-cache-service";
import {
  runBeginWifiTransferCommand,
  runFinishWifiTransferCommand,
  runReceiveWifiSongCommand,
} from "../services/import-session-wifi-command-flow-service";
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
    (total: number) =>
      runBeginWifiTransferCommand({
        dispatch,
        prepareWifiImportCache: createImportCacheDirectory,
        total,
      }),
    [dispatch],
  );

  const receiveWifiSong = useCallback(
    (song: ImportSongDraft) => {
      runReceiveWifiSongCommand({ dispatch, song });
    },
    [dispatch],
  );

  const finishWifiTransfer = useCallback(() => {
    runFinishWifiTransferCommand({ dispatch, songs });
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
