import * as Network from "expo-network";
import { usePathname } from "expo-router";
import { useEffect, useReducer } from "react";
import {
  startWifiImportBridgeServer,
  type WifiImportBridgeServerStartup,
} from "../services/wifi-import-bridge-server-service";
import {
  createWifiImportRouteHandlers,
  createWifiImportRouteRuntimeState,
} from "../services/wifi-import-server-route-service";
import {
  getWifiImportServerAddress,
  initialWifiImportServerState,
  wifiImportServerReducer,
} from "../services/wifi-import-server-state-service";
import {
  getWifiImportServerStartErrorMessage,
  isWifiImportTransferPathname,
} from "../services/wifi-import-request-service";
import { useImportSessionSelector } from "./use-import-session";
import { useWifiImportRouteDependencies } from "./use-wifi-import-route-dependencies";

export function useWifiImportServer() {
  const pathname = usePathname();
  const allowTransfer = isWifiImportTransferPathname(pathname);
  const beginWifiTransfer = useImportSessionSelector(
    (store) => store.beginWifiTransfer,
  );
  const failSession = useImportSessionSelector((store) => store.failSession);
  const finishWifiTransfer = useImportSessionSelector(
    (store) => store.finishWifiTransfer,
  );
  const receiveWifiSong = useImportSessionSelector(
    (store) => store.receiveWifiSong,
  );
  const [serverState, dispatchServerState] = useReducer(
    wifiImportServerReducer,
    initialWifiImportServerState,
  );
  const getRouteDependencies = useWifiImportRouteDependencies({
    allowTransfer,
    beginWifiTransfer,
    failSession,
    finishWifiTransfer,
    receiveWifiSong,
  });

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
    let activeServer: WifiImportBridgeServerStartup["server"] | null = null;
    const routeHandlers = createWifiImportRouteHandlers({
      dependencies: getRouteDependencies,
      runtimeState: createWifiImportRouteRuntimeState(),
    });

    try {
      const { port, server } = startWifiImportBridgeServer({ routeHandlers });
      activeServer = server;
      dispatchServerState({
        port,
        type: "start",
      });
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
  }, [getRouteDependencies]);

  return {
    ...serverState,
    address: getWifiImportServerAddress(serverState),
  };
}
