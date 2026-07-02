import * as Network from "expo-network";
import { useEffect, useReducer, useRef } from "react";
import { BridgeServer } from "react-native-http-bridge-refurbished";
import {
  createWifiImportRouteHandlers,
  createWifiImportRouteRuntimeState,
} from "../services/wifi-import-server-route-service";
import {
  getWifiImportServerAddress,
  initialWifiImportServerState,
  wifiImportServerReducer,
} from "../services/wifi-import-server-state-service";
import { getWifiImportServerStartErrorMessage } from "../services/wifi-import-request-service";
import { useImportSession } from "./use-import-session";

const wifiImportPorts = [3000, 3001, 3002, 3003, 3004] as const;

export function useWifiImportServer() {
  const {
    beginWifiTransfer,
    failSession,
    finishWifiTransfer,
    receiveWifiSong,
  } = useImportSession();
  const [serverState, dispatchServerState] = useReducer(
    wifiImportServerReducer,
    initialWifiImportServerState,
  );
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
          dispatchServerState({
            ipAddress: nextAddress,
            type: "resolve-address",
          });
        }
      } catch {
        if (isMounted) {
          dispatchServerState({ type: "clear-address" });
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
          dispatchServerState({
            port: nextPort,
            type: "start",
          });
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

    } catch (caughtError) {
      dispatchServerState({
        error: getWifiImportServerStartErrorMessage(caughtError),
        type: "fail",
      });
    }

    return () => {
      dispatchServerState({ type: "stop" });
      activeServer?.stop();
    };
  }, []);

  return {
    ...serverState,
    address: getWifiImportServerAddress(serverState),
  };
}
