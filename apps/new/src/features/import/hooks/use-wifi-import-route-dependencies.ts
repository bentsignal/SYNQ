import { useCallback, useEffect, useRef } from "react";
import type { ImportSongDraft } from "../types/import-session";

export type WifiImportRouteDependencyCallbacks = {
  allowTransfer: boolean;
  beginWifiTransfer: (transferSize: number) => Promise<boolean>;
  failSession: (message: string) => void;
  finishWifiTransfer: () => void;
  receiveWifiSong: (song: ImportSongDraft) => void;
};

export const useWifiImportRouteDependencies = ({
  allowTransfer,
  beginWifiTransfer,
  failSession,
  finishWifiTransfer,
  receiveWifiSong,
}: WifiImportRouteDependencyCallbacks) => {
  const callbacksRef = useRef<WifiImportRouteDependencyCallbacks>({
    allowTransfer,
    beginWifiTransfer,
    failSession,
    finishWifiTransfer,
    receiveWifiSong,
  });

  useEffect(() => {
    callbacksRef.current = {
      allowTransfer,
      beginWifiTransfer,
      failSession,
      finishWifiTransfer,
      receiveWifiSong,
    };
  }, [
    allowTransfer,
    beginWifiTransfer,
    failSession,
    finishWifiTransfer,
    receiveWifiSong,
  ]);

  return useCallback(() => callbacksRef.current, []);
};
