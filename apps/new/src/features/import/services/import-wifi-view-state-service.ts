import type { ImportSessionState } from "../types/import-session";
import { getImportWifiActionState } from "./import-wifi-action-state-service";
import { getImportWifiState } from "./import-wifi-status-state-service";
import {
  getImportSongPreviewEmptyState,
  getImportSongPreviewListState,
} from "./import-song-preview-state-service";

export const getImportWifiViewState = ({
  error,
  isReady,
  state,
}: {
  error: string | null;
  isReady: boolean;
  state: ImportSessionState;
}) => ({
  actionState: getImportWifiActionState(),
  songPreviewEmptyState: getImportSongPreviewEmptyState(),
  songPreviewListState: getImportSongPreviewListState({
    songs: state.songs,
  }),
  wifiState: getImportWifiState({ error, isReady, state }),
});
