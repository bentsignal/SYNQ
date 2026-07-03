import type { ImportSongDraft } from "../types/import-session";
import {
  getWifiStartTransferDecision,
  getWifiUploadDecision,
  getWifiUploadFailureResponse,
  type WifiImportJsonResponse,
  wifiImportFinishResponse,
  wifiImportPrepareFailureResponse,
  wifiImportResetResponse,
} from "./wifi-import-request-service";

export type WifiBridgeRequest = {
  postData?: unknown;
};

export type WifiBridgeResponse = {
  html: (html: string) => void;
  json: (payload: object, status?: number) => unknown;
};

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

export type WifiImportRouteHandlerDependencies = {
  allowTransfer: boolean;
  beginWifiTransfer: (transferSize: number) => Promise<boolean>;
  failSession: (message: string) => void;
  finishWifiTransfer: () => void;
  getConnectionResponse: () => object;
  getTransferPage: () => string;
  receiveWifiSong: (song: ImportSongDraft) => void;
  stageWifiImportFile: (params: {
    data: string;
    id: number;
    name: string;
    type: string;
  }) => Promise<ImportSongDraft>;
};

const sendWifiImportJsonResponse = (
  response: WifiBridgeResponse,
  payload: WifiImportJsonResponse,
) => {
  response.json(payload, payload.status);
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
    response.json(dependencies().getConnectionResponse(), 200);
  },
  handleFileUpload: async (request, response) => {
    const routeDependencies = dependencies();

    try {
      const decision = getWifiUploadDecision({
        postData: request.postData,
        receivedIds: runtimeState.receivedIds,
      });

      if (!decision.shouldAccept) {
        sendWifiImportJsonResponse(response, decision.response);
        return;
      }

      const song = await routeDependencies.stageWifiImportFile({
        data: decision.upload.b64,
        id: decision.upload.id,
        name: decision.upload.name,
        type: decision.upload.type,
      });

      runtimeState.receivedIds.add(decision.upload.id);
      routeDependencies.receiveWifiSong(song);
      sendWifiImportJsonResponse(response, decision.response);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : String(caughtError);

      routeDependencies.failSession(message);
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
    response.html(dependencies().getTransferPage());
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
