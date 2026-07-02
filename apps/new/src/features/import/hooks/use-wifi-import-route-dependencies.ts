import { useCallback, useEffect, useRef } from "react";
import type { ImportSongDraft } from "../types/import-session";

export type WifiImportRouteDependencyCallbacks = {
  beginWifiTransfer: (transferSize: number) => Promise<boolean>;
  failSession: (message: string) => void;
  finishWifiTransfer: () => void;
  receiveWifiSong: (song: ImportSongDraft) => void;
};

export const useWifiImportRouteDependencies = ({
  beginWifiTransfer,
  failSession,
  finishWifiTransfer,
  receiveWifiSong,
}: WifiImportRouteDependencyCallbacks) => {
  const callbacksRef = useRef<WifiImportRouteDependencyCallbacks>({
    beginWifiTransfer,
    failSession,
    finishWifiTransfer,
    receiveWifiSong,
  });

  useEffect(() => {
    callbacksRef.current = {
      beginWifiTransfer,
      failSession,
      finishWifiTransfer,
      receiveWifiSong,
    };
  }, [beginWifiTransfer, failSession, finishWifiTransfer, receiveWifiSong]);

  return useCallback(() => callbacksRef.current, []);
};
