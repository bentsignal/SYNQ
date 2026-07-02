import * as Network from "expo-network";
import { useEffect, useRef, useState } from "react";
import { BridgeServer } from "react-native-http-bridge-refurbished";
import {
  createWifiImportRouteHandlers,
  createWifiImportRouteRuntimeState,
} from "../services/wifi-import-server-route-service";
import { useImportSession } from "./use-import-session";

const wifiImportPorts = [3000, 3001, 3002, 3003, 3004] as const;

export function useWifiImportServer() {
  const {
    beginWifiTransfer,
    failSession,
    finishWifiTransfer,
    receiveWifiSong,
  } = useImportSession();
  const [error, setError] = useState<string | null>(null);
  const [ipAddress, setIpAddress] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [port, setPort] = useState<number | null>(null);
  const beginWifiTransferRef = useRef(beginWifiTransfer);
  const failSessionRef = useRef(failSession);
  const finishWifiTransferRef = useRef(finishWifiTransfer);
  const receiveWifiSongRef = useRef(receiveWifiSong);

  useEffect(() => {
    beginWifiTransferRef.current = beginWifiTransfer;
    failSessionRef.current = failSession;
    finishWifiTransferRef.current = finishWifiTransfer;
    receiveWifiSongRef.current = receiveWifiSong;
  }, [beginWifiTransfer, failSession, finishWifiTransfer, receiveWifiSong]);

  useEffect(() => {
    let isMounted = true;

    const loadIpAddress = async () => {
      try {
        const nextAddress = await Network.getIpAddressAsync();
        if (isMounted) {
          setIpAddress(nextAddress);
        }
      } catch {
        if (isMounted) {
          setIpAddress("");
        }
      }
    };

    void loadIpAddress();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let activeServer: BridgeServer | null = null;
    const routeHandlers = createWifiImportRouteHandlers({
      dependencies: () => ({
        beginWifiTransfer: beginWifiTransferRef.current,
        failSession: failSessionRef.current,
        finishWifiTransfer: finishWifiTransferRef.current,
        receiveWifiSong: receiveWifiSongRef.current,
      }),
      runtimeState: createWifiImportRouteRuntimeState(),
    });

    const registerRoutes = (server: BridgeServer) => {
      server.get("/", routeHandlers.handleRoot);
      server.get("/reset", routeHandlers.handleReset);
      server.get("/checkConnection", routeHandlers.handleConnection);
      server.post("/startTransfer", routeHandlers.handleStartTransfer);
      server.post("/finishTransfer", routeHandlers.handleFinishTransfer);
      server.post("/fileUpload", routeHandlers.handleFileUpload);
    };

    try {
      for (const nextPort of wifiImportPorts) {
        const server = new BridgeServer("synq_import_service", true);

        try {
          server.listen(nextPort);
          registerRoutes(server);
          activeServer = server;
          setPort(nextPort);
          break;
        } catch {
          server.stop();
        }
      }

      if (!activeServer) {
        throw new Error(
          `Wi-Fi transfer server could not start on ports ${wifiImportPorts.join(", ")}.`,
        );
      }

      setError(null);
      setIsReady(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Wi-Fi transfer server could not start.",
      );
      setIsReady(false);
      setPort(null);
    }

    return () => {
      setIsReady(false);
      setPort(null);
      activeServer?.stop();
    };
  }, []);

  return {
    address: ipAddress && port ? `http://${ipAddress}:${port}` : "",
    error,
    isReady,
    port,
  };
}
