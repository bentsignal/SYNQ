import * as Device from "expo-device";
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
import { getWifiTransferPage } from "./wifi-transfer-page";
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
  beginWifiTransfer: (transferSize: number) => Promise<boolean>;
  failSession: (message: string) => void;
  finishWifiTransfer: () => void;
  receiveWifiSong: (song: ImportSongDraft) => void;
};

export type WifiImportRouteRuntimeState = {
  isMidTransfer: boolean;
  receivedIds: Set<number>;
};

const sendJson = (
  response: WifiBridgeResponse,
  payload: { message: string; status: number },
) => {
  response.json(payload, payload.status);
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
    response.json(
      {
        deviceName: Device.deviceName ?? "SYNQ",
      },
      200,
    );
  },
  handleFileUpload: async (request, response) => {
    try {
      const decision = getWifiUploadDecision({
        postData: request.postData,
        receivedIds: runtimeState.receivedIds,
      });

      if (!decision.shouldAccept) {
        sendJson(response, decision.response);
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
      sendJson(response, decision.response);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : String(caughtError);

      dependencies().failSession(message);
      sendJson(response, getWifiUploadFailureResponse(message));
    }
  },
  handleFinishTransfer: async (_request, response) => {
    runtimeState.isMidTransfer = false;
    dependencies().finishWifiTransfer();
    sendJson(response, wifiImportFinishResponse);
  },
  handleReset: async (_request, response) => {
    runtimeState.receivedIds.clear();
    runtimeState.isMidTransfer = false;
    sendJson(response, wifiImportResetResponse);
  },
  handleRoot: async (_request, response) => {
    response.html(getWifiTransferPage());
  },
  handleStartTransfer: async (request, response) => {
    const decision = getWifiStartTransferDecision({
      isMidTransfer: runtimeState.isMidTransfer,
      postData: request.postData,
    });

    if (!decision.shouldStart) {
      sendJson(response, decision.response);
      return;
    }

    runtimeState.receivedIds.clear();
    const canStart = await dependencies().beginWifiTransfer(
      decision.transferSize,
    );

    if (!canStart) {
      sendJson(response, wifiImportPrepareFailureResponse);
      return;
    }

    runtimeState.isMidTransfer = true;
    sendJson(response, decision.response);
  },
});
