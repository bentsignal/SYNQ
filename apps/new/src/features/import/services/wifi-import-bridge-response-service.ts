import type { WifiBridgeResponse } from "./wifi-import-bridge-types";
import type { WifiImportJsonResponse } from "./wifi-import-response-service";

export const sendWifiImportJsonResponse = (
  response: WifiBridgeResponse,
  payload: WifiImportJsonResponse,
) => {
  response.json(payload, payload.status);
};
