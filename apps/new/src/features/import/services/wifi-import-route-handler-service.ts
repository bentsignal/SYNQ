import type {
  WifiBridgeRequest,
  WifiBridgeResponse,
} from "./wifi-import-bridge-types";
import {
  wifiImportFinishResponse,
  wifiImportResetResponse,
} from "./wifi-import-response-service";
import { sendWifiImportJsonResponse } from "./wifi-import-bridge-response-service";
import type { WifiImportRouteRuntimeState } from "./wifi-import-route-runtime-state-service";
import {
  runWifiImportFileUploadRoute,
  type WifiImportRouteHandlerDependencies,
} from "./wifi-import-route-operation-service";
import { runWifiImportStartTransferRoute } from "./wifi-import-start-transfer-route-service";

export type WifiImportRouteHandlers = {
  handleConnection: (
    request: WifiBridgeRequest,
    response: WifiBridgeResponse,
  ) => Promise<void>;
  handleFileUpload: (
    request: WifiBridgeRequest,
    response: WifiBridgeResponse,
  ) => Promise<void>;
  handleFinishTransfer: (
    request: WifiBridgeRequest,
    response: WifiBridgeResponse,
  ) => Promise<void>;
  handleReset: (
    request: WifiBridgeRequest,
    response: WifiBridgeResponse,
  ) => Promise<void>;
  handleRoot: (
    request: WifiBridgeRequest,
    response: WifiBridgeResponse,
  ) => Promise<void>;
  handleStartTransfer: (
    request: WifiBridgeRequest,
    response: WifiBridgeResponse,
  ) => Promise<void>;
};

export type { WifiImportRouteHandlerDependencies } from "./wifi-import-route-operation-service";

export const createWifiImportRouteHandlers = ({
  dependencies,
  runtimeState,
}: {
  dependencies: () => WifiImportRouteHandlerDependencies;
  runtimeState: WifiImportRouteRuntimeState;
}): WifiImportRouteHandlers => ({
  handleConnection: async (_request, response) => {
    response.json(dependencies().getConnectionResponse(), 200);
  },
  handleFileUpload: async (request, response) => {
    await runWifiImportFileUploadRoute({
      dependencies: dependencies(),
      request,
      response,
      runtimeState,
    });
  },
  handleFinishTransfer: async (_request, response) => {
    runtimeState.isMidTransfer = false;
    dependencies().finishWifiTransfer();
    sendWifiImportJsonResponse(response, wifiImportFinishResponse);
  },
  handleReset: async (_request, response) => {
    runtimeState.receivedIds.clear();
    runtimeState.isMidTransfer = false;
    sendWifiImportJsonResponse(response, wifiImportResetResponse);
  },
  handleRoot: async (_request, response) => {
    response.html(dependencies().getTransferPage());
  },
  handleStartTransfer: async (request, response) => {
    await runWifiImportStartTransferRoute({
      dependencies: dependencies(),
      request,
      response,
      runtimeState,
    });
  },
});
