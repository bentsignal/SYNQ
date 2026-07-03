import { stageWifiImportFile } from "./import-file-service";
import { getWifiTransferPage } from "./wifi-transfer-page";
import type {
  WifiBridgeRequest,
  WifiBridgeResponse,
} from "./wifi-import-bridge-types";
import { getWifiImportConnectionResponse } from "./wifi-import-route-response-service";
import {
  createWifiImportRouteHandlers as createWifiImportRouteHandlersWithDependencies,
  type WifiImportRouteHandlerDependencies,
  type WifiImportRouteHandlers,
} from "./wifi-import-route-handler-service";
import {
  createWifiImportRouteRuntimeState,
  type WifiImportRouteRuntimeState,
} from "./wifi-import-route-runtime-state-service";

export {
  createWifiImportRouteRuntimeState,
  type WifiBridgeRequest,
  type WifiBridgeResponse,
  type WifiImportRouteHandlers,
  type WifiImportRouteRuntimeState,
};

type WifiImportRouteServerDependencies = Omit<
  WifiImportRouteHandlerDependencies,
  "getConnectionResponse" | "getTransferPage" | "stageWifiImportFile"
>;

export const createWifiImportRouteHandlers = ({
  dependencies,
  runtimeState,
}: {
  dependencies: () => WifiImportRouteServerDependencies;
  runtimeState: WifiImportRouteRuntimeState;
}): WifiImportRouteHandlers =>
  createWifiImportRouteHandlersWithDependencies({
    dependencies: () => ({
      ...dependencies(),
      getConnectionResponse: getWifiImportConnectionResponse,
      getTransferPage: getWifiTransferPage,
      stageWifiImportFile,
    }),
    runtimeState,
  });
