import * as Device from "expo-device";
import type { WifiImportJsonResponse } from "./wifi-import-request-service";
import { getWifiTransferPage } from "./wifi-transfer-page";
import type { WifiBridgeResponse } from "./wifi-import-server-route-service";

export const getWifiImportConnectionResponse = () => ({
  deviceName: Device.deviceName ?? "SYNQ",
});

export const sendWifiImportJsonResponse = (
  response: WifiBridgeResponse,
  payload: WifiImportJsonResponse,
) => {
  response.json(payload, payload.status);
};

export const sendWifiImportTransferPage = (response: WifiBridgeResponse) => {
  response.html(getWifiTransferPage());
};
