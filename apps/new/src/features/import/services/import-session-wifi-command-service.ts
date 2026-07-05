import {
  runBeginWifiTransferCommand,
  runFinishWifiTransferCommand,
  runReceiveWifiSongCommand,
} from "./import-session-wifi-command-flow-service";
import type { ImportSessionAction } from "./import-session-state-service";
import type { ImportSongDraft } from "../types/import-session";

type CreateImportSessionWifiCommandsParams = {
  dispatch: (action: ImportSessionAction) => void;
  prepareWifiImportCache: () => Promise<void>;
  songs: ImportSongDraft[];
};

export type ImportSessionWifiCommands = {
  beginWifiTransfer: (total: number) => Promise<boolean>;
  finishWifiTransfer: () => void;
  receiveWifiSong: (song: ImportSongDraft) => void;
};

export const createImportSessionWifiCommands = ({
  dispatch,
  prepareWifiImportCache,
  songs,
}: CreateImportSessionWifiCommandsParams): ImportSessionWifiCommands => ({
  beginWifiTransfer: (total) =>
    runBeginWifiTransferCommand({
      dispatch,
      prepareWifiImportCache,
      total,
    }),
  finishWifiTransfer: () => {
    runFinishWifiTransferCommand({ dispatch, songs });
  },
  receiveWifiSong: (song) => {
    runReceiveWifiSongCommand({ dispatch, song });
  },
});
