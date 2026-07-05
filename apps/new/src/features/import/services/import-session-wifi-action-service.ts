import type { ImportSessionAction } from "./import-session-action-service";
import type { ImportSongDraft } from "../types/import-session";

export const getFinishWifiTransferAction = (
  songs: ImportSongDraft[],
): ImportSessionAction =>
  songs.length > 0
    ? { songs, type: "review" }
    : { error: "No Wi-Fi songs were received.", type: "fail" };
