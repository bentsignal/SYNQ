import * as Device from "expo-device";
import type { WifiBridgeResponse } from "./wifi-import-bridge-types";
import {
  sendWifiImportJsonResponse,
} from "./wifi-import-bridge-response-service";
import { getWifiTransferPage } from "./wifi-transfer-page";

export { sendWifiImportJsonResponse };

export const getWifiImportConnectionResponse = () => ({
  deviceName: Device.deviceName ?? "SYNQ",
});

export const sendWifiImportTransferPage = (response: WifiBridgeResponse) => {
  response.html(getWifiTransferPage());
};
