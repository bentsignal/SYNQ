import {
  getBeginWifiTransferAction,
  getFailImportSessionAction,
  getFinishWifiTransferAction,
  getImportSessionCommandErrorMessage,
  getReceiveWifiSongAction,
} from "./import-session-command-service";
import type { ImportSessionAction } from "./import-session-state-service";
import type { ImportSongDraft } from "../types/import-session";

type ImportSessionWifiCommandDispatch = (action: ImportSessionAction) => void;

export const runBeginWifiTransferCommand = async ({
  dispatch,
  prepareWifiImportCache,
  total,
}: {
  dispatch: ImportSessionWifiCommandDispatch;
  prepareWifiImportCache: () => Promise<void>;
  total: number;
}) => {
  try {
    await prepareWifiImportCache();
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
};

export const runReceiveWifiSongCommand = ({
  dispatch,
  song,
}: {
  dispatch: ImportSessionWifiCommandDispatch;
  song: ImportSongDraft;
}) => {
  dispatch(getReceiveWifiSongAction(song));
};

export const runFinishWifiTransferCommand = ({
  dispatch,
  songs,
}: {
  dispatch: ImportSessionWifiCommandDispatch;
  songs: ImportSongDraft[];
}) => {
  dispatch(getFinishWifiTransferAction(songs));
};
