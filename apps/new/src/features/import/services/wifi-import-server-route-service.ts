import type { Request, Response } from "react-native-http-bridge-refurbished";
import { stageWifiImportFile } from "./import-file-service";
import {
  getWifiStartTransferDecision,
  getWifiUploadDecision,
  getWifiUploadFailureResponse,
  wifiImportFinishResponse,
  wifiImportPrepareFailureResponse,
  wifiImportResetResponse,
} from "./wifi-import-request-service";
import {
  getWifiImportConnectionResponse,
  sendWifiImportJsonResponse,
  sendWifiImportTransferPage,
} from "./wifi-import-route-response-service";
import type { ImportSongDraft } from "../types/import-session";

export type WifiBridgeRequest = Request<unknown>;
export type WifiBridgeResponse = Response;

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

type WifiImportRouteHandlerDependencies = {
  allowTransfer: boolean;
  beginWifiTransfer: (transferSize: number) => Promise<boolean>;
  failSession: (message: string) => void;
  finishWifiTransfer: () => void;
  receiveWifiSong: (song: ImportSongDraft) => void;
};

export type WifiImportRouteRuntimeState = {
  isMidTransfer: boolean;
  receivedIds: Set<number>;
};

export const createWifiImportRouteRuntimeState =
  (): WifiImportRouteRuntimeState => ({
    isMidTransfer: false,
    receivedIds: new Set<number>(),
  });

export const createWifiImportRouteHandlers = ({
  dependencies,
  runtimeState,
}: {
  dependencies: () => WifiImportRouteHandlerDependencies;
  runtimeState: WifiImportRouteRuntimeState;
}): WifiImportRouteHandlers => ({
  handleConnection: async (_request, response) => {
    response.json(getWifiImportConnectionResponse(), 200);
  },
  handleFileUpload: async (request, response) => {
    try {
      const decision = getWifiUploadDecision({
        postData: request.postData,
        receivedIds: runtimeState.receivedIds,
      });

      if (!decision.shouldAccept) {
        sendWifiImportJsonResponse(response, decision.response);
        return;
      }

      const song = await stageWifiImportFile({
        data: decision.upload.b64,
        id: decision.upload.id,
        name: decision.upload.name,
        type: decision.upload.type,
      });

      runtimeState.receivedIds.add(decision.upload.id);
      dependencies().receiveWifiSong(song);
      sendWifiImportJsonResponse(response, decision.response);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : String(caughtError);

      dependencies().failSession(message);
      sendWifiImportJsonResponse(
        response,
        getWifiUploadFailureResponse(message),
      );
    }
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
    sendWifiImportTransferPage(response);
  },
  handleStartTransfer: async (request, response) => {
    const routeDependencies = dependencies();
    const decision = getWifiStartTransferDecision({
      allowTransfer: routeDependencies.allowTransfer,
      isMidTransfer: runtimeState.isMidTransfer,
      postData: request.postData,
    });

    if (!decision.shouldStart) {
      sendWifiImportJsonResponse(response, decision.response);
      return;
    }

    runtimeState.receivedIds.clear();
    const canStart = await routeDependencies.beginWifiTransfer(
      decision.transferSize,
    );

    if (!canStart) {
      sendWifiImportJsonResponse(response, wifiImportPrepareFailureResponse);
      return;
    }

    runtimeState.isMidTransfer = true;
    sendWifiImportJsonResponse(response, decision.response);
  },
});
