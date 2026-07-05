import type { ImportSessionAction } from "./import-session-action-types-service";
import type { ImportSongDraft } from "../types/import-session";

export const getBeginWifiTransferAction = (
  total: number,
): ImportSessionAction => ({
  total,
  type: "begin-wifi-transfer",
});

export const getReceiveWifiSongAction = (
  song: ImportSongDraft,
): ImportSessionAction => ({
  song,
  type: "receive-wifi-song",
});

export const getFinishWifiTransferAction = (
  songs: ImportSongDraft[],
): ImportSessionAction =>
  songs.length > 0
    ? { songs, type: "review" }
    : { error: "No Wi-Fi songs were received.", type: "fail" };
