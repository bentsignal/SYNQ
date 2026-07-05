import type {
  WifiBridgeRequest,
  WifiBridgeResponse,
} from "./wifi-import-bridge-types";
import { sendWifiImportJsonResponse } from "./wifi-import-bridge-response-service";
import { wifiImportPrepareFailureResponse } from "./wifi-import-response-service";
import type { WifiImportRouteRuntimeState } from "./wifi-import-route-runtime-state-service";
import { getWifiStartTransferDecision } from "./wifi-import-transfer-decision-service";
import type { WifiImportRouteHandlerDependencies } from "./wifi-import-route-operation-service";

export const runWifiImportStartTransferRoute = async ({
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
  const decision = getWifiStartTransferDecision({
    allowTransfer: dependencies.allowTransfer,
    isMidTransfer: runtimeState.isMidTransfer,
    postData: request.postData,
  });

  if (!decision.shouldStart) {
    sendWifiImportJsonResponse(response, decision.response);
    return;
  }

  runtimeState.receivedIds.clear();
  const canStart = await dependencies.beginWifiTransfer(decision.transferSize);

  if (!canStart) {
    sendWifiImportJsonResponse(response, wifiImportPrepareFailureResponse);
    return;
  }

  runtimeState.isMidTransfer = true;
  sendWifiImportJsonResponse(response, decision.response);
};
