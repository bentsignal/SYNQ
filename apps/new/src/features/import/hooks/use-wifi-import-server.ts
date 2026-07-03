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
  getWifiImportServerAddress,
  initialWifiImportServerState,
  wifiImportServerReducer,
} from "../services/wifi-import-server-state-service";
import {
  resolveWifiImportServerAddressAction,
  startWifiImportServerWithDependencies,
  type WifiImportServerStartup,
} from "../services/wifi-import-server-command-service";
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

    const loadIpAddress = async () => {
      const action = await resolveWifiImportServerAddressAction({
        getIpAddress: Network.getIpAddressAsync,
      });

      if (isMounted) {
        dispatchServerState(action);
      }
    };

    void loadIpAddress();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const startup = startWifiImportServerWithDependencies({
      createRouteHandlers: createWifiImportRouteHandlers,
      createRuntimeState: createWifiImportRouteRuntimeState,
      getRouteDependencies,
      startServer: startWifiImportBridgeServer,
    });
    let activeServer: WifiImportServerStartup["server"] | null =
      startup.server;
    dispatchServerState(startup.action);

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
