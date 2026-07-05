import type { ImportSongDraft } from "../types/import-session";
import type {
  WifiBridgeRequest,
  WifiBridgeResponse,
} from "./wifi-import-bridge-types";
import { sendWifiImportJsonResponse } from "./wifi-import-bridge-response-service";
import {
  getWifiUploadFailureResponse,
} from "./wifi-import-response-service";
import type { WifiImportRouteRuntimeState } from "./wifi-import-route-runtime-state-service";
import { getWifiUploadDecision } from "./wifi-import-upload-decision-service";

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

export const runWifiImportFileUploadRoute = async ({
  dependencies,
  request,
  response,
  runtimeState,
}: {
  dependencies: WifiImportRouteHandlerDependencies;
  request: WifiBridgeRequest;
  response: WifiBridgeResponse;
  runtimeState: WifiImportRouteRuntimeState;
}) => {
  try {
    const decision = getWifiUploadDecision({
      postData: request.postData,
      receivedIds: runtimeState.receivedIds,
    });

    if (!decision.shouldAccept) {
      sendWifiImportJsonResponse(response, decision.response);
      return;
    }

    const song = await dependencies.stageWifiImportFile({
      data: decision.upload.b64,
      id: decision.upload.id,
      name: decision.upload.name,
      type: decision.upload.type,
    });

    runtimeState.receivedIds.add(decision.upload.id);
    dependencies.receiveWifiSong(song);
    sendWifiImportJsonResponse(response, decision.response);
  } catch (caughtError) {
    const message =
      caughtError instanceof Error ? caughtError.message : String(caughtError);

    dependencies.failSession(message);
    sendWifiImportJsonResponse(
      response,
      getWifiUploadFailureResponse(message),
    );
  }
};
