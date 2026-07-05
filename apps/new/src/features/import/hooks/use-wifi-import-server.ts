import * as Network from "expo-network";
import { usePathname } from "expo-router";
import { useEffect, useReducer } from "react";
import {
  startWifiImportBridgeServer,
} from "../services/wifi-import-bridge-server-service";
import {
  createWifiImportRouteHandlers,
  createWifiImportRouteRuntimeState,
} from "../services/wifi-import-server-route-service";
import {
  initialWifiImportServerState,
  wifiImportServerReducer,
} from "../services/wifi-import-server-state-service";
import { getWifiImportServerAddress } from "../services/wifi-import-server-view-state-service";
import {
  runWifiImportServerAddressLoadCommand,
  runWifiImportServerStartupCommand,
} from "../services/wifi-import-server-command-flow-service";
import { isWifiImportTransferPathname } from "../services/wifi-import-transfer-decision-service";
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

    void runWifiImportServerAddressLoadCommand({
      dispatch: dispatchServerState,
      getIpAddress: Network.getIpAddressAsync,
      isActive: () => isMounted,
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return runWifiImportServerStartupCommand({
      createRouteHandlers: createWifiImportRouteHandlers,
      createRuntimeState: createWifiImportRouteRuntimeState,
      dispatch: dispatchServerState,
      getRouteDependencies,
      startServer: startWifiImportBridgeServer,
    });
  }, [getRouteDependencies]);

  return {
    ...serverState,
    address: getWifiImportServerAddress(serverState),
  };
}
